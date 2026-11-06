import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/expense.dart';

/// Saves and loads expenses on the phone using SharedPreferences.
///
/// All expenses are stored together as one JSON string under [_storageKey].
class ExpenseStorageService {
  static const String _storageKey = 'expenses';

  /// Loads all saved expenses. Returns an empty list on first launch.
  ///
  /// Throws a [StorageException] if the saved data cannot be read.
  Future<List<Expense>> loadExpenses() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString = prefs.getString(_storageKey);
      if (jsonString == null || jsonString.isEmpty) return [];

      final List<dynamic> decoded = jsonDecode(jsonString) as List<dynamic>;
      return decoded
          .map((item) => Expense.fromJson(item as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw StorageException('Could not load your saved expenses.');
    }
  }

  /// Saves the full list of expenses, replacing what was stored before.
  ///
  /// Throws a [StorageException] if saving fails.
  Future<void> saveExpenses(List<Expense> expenses) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString =
          jsonEncode(expenses.map((expense) => expense.toJson()).toList());
      final ok = await prefs.setString(_storageKey, jsonString);
      if (!ok) throw StorageException('Could not save your expenses.');
    } on StorageException {
      rethrow;
    } catch (e) {
      throw StorageException('Could not save your expenses.');
    }
  }
}

/// A friendly error used when reading or writing storage fails.
class StorageException implements Exception {
  final String message;
  StorageException(this.message);

  @override
  String toString() => message;
}
