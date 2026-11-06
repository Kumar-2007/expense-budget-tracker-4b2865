import 'package:flutter/foundation.dart';

import '../models/expense.dart';
import '../services/expense_storage_service.dart';

/// Holds the list of expenses and tells the screens when it changes.
///
/// Screens read data with `context.watch<ExpenseProvider>()` and call
/// methods like [addExpense] with `context.read<ExpenseProvider>()`.
class ExpenseProvider extends ChangeNotifier {
  ExpenseProvider({ExpenseStorageService? storage})
      : _storage = storage ?? ExpenseStorageService();

  final ExpenseStorageService _storage;

  List<Expense> _expenses = [];
  bool _isLoading = false;
  String? _errorMessage;

  /// All expenses, newest date first.
  List<Expense> get expenses {
    final sorted = [..._expenses];
    sorted.sort((a, b) => b.date.compareTo(a.date));
    return List.unmodifiable(sorted);
  }

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get hasError => _errorMessage != null;

  /// The most recent expenses for the dashboard.
  List<Expense> recentExpenses([int count = 5]) =>
      expenses.take(count).toList();

  /// Finds one expense by its id (or null if it was deleted).
  Expense? findById(String id) {
    for (final expense in _expenses) {
      if (expense.id == id) return expense;
    }
    return null;
  }

  /// Total of every expense ever saved.
  double get totalSpending =>
      _expenses.fold(0.0, (sum, expense) => sum + expense.amount);

  /// Total spent in the current calendar month.
  double get monthlySpending {
    final now = DateTime.now();
    return _expenses
        .where((e) => e.date.year == now.year && e.date.month == now.month)
        .fold(0.0, (sum, expense) => sum + expense.amount);
  }

  /// Total spending for each category, e.g. {'Food': 500.0, ...}.
  Map<String, double> get categoryTotals {
    final totals = {for (final category in kCategories) category: 0.0};
    for (final expense in _expenses) {
      totals[expense.category] = (totals[expense.category] ?? 0) + expense.amount;
    }
    return totals;
  }

  /// Loads saved expenses when the app starts (and when Retry is pressed).
  Future<void> loadExpenses() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      _expenses = await _storage.loadExpenses();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Adds a new expense and saves it. Throws if saving fails.
  Future<void> addExpense(Expense expense) async {
    final updated = [..._expenses, expense];
    await _storage.saveExpenses(updated); // Save first, then update the UI.
    _expenses = updated;
    notifyListeners();
  }

  /// Deletes an expense by id and saves the change. Throws if saving fails.
  Future<void> deleteExpense(String id) async {
    final updated = _expenses.where((e) => e.id != id).toList();
    await _storage.saveExpenses(updated);
    _expenses = updated;
    notifyListeners();
  }
}
