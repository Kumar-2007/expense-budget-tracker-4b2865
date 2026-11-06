import 'package:expense_tracker/main.dart';
import 'package:expense_tracker/models/expense.dart';
import 'package:expense_tracker/providers/expense_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() {
    // Start every test with empty, in-memory storage.
    SharedPreferences.setMockInitialValues({});
  });

  group('Expense model', () {
    test('toJson and fromJson keep every field', () {
      final expense = Expense(
        id: '1',
        title: 'Lunch',
        amount: 250,
        category: 'Food',
        date: DateTime(2026, 11, 6),
        note: 'Canteen',
      );
      final copy = Expense.fromJson(expense.toJson());
      expect(copy.id, '1');
      expect(copy.title, 'Lunch');
      expect(copy.amount, 250);
      expect(copy.category, 'Food');
      expect(copy.date, DateTime(2026, 11, 6));
      expect(copy.note, 'Canteen');
    });

    test('formatRupees uses ₹ and Indian grouping', () {
      expect(formatRupees(250), '₹250.00');
      expect(formatRupees(1000), '₹1,000.00');
      expect(formatRupees(12500.5), '₹12,500.50');
      expect(formatRupees(125000), '₹1,25,000.00');
    });
  });

  group('ExpenseProvider', () {
    test('adds, totals, deletes and persists expenses', () async {
      final provider = ExpenseProvider();
      await provider.loadExpenses();
      final now = DateTime.now();

      await provider.addExpense(Expense(
          id: 'a', title: 'Lunch', amount: 500, category: 'Food', date: now));
      await provider.addExpense(Expense(
          id: 'b', title: 'Bus', amount: 250, category: 'Travel', date: now));
      await provider.addExpense(Expense(
          id: 'c', title: 'Shirt', amount: 300, category: 'Shopping', date: now));

      expect(provider.totalSpending, 1050);
      expect(provider.monthlySpending, 1050);
      expect(provider.categoryTotals['Food'], 500);
      expect(provider.categoryTotals['Travel'], 250);
      expect(provider.categoryTotals['Bills'], 0);

      await provider.deleteExpense('b');
      expect(provider.expenses.length, 2);
      expect(provider.categoryTotals['Travel'], 0);

      // Persistence: a brand-new provider reads the same saved data.
      final reopened = ExpenseProvider();
      await reopened.loadExpenses();
      expect(reopened.expenses.length, 2);
      expect(reopened.totalSpending, 800);
    });
  });

  group('App flow', () {
    testWidgets('shows the empty dashboard message', (tester) async {
      await tester.pumpWidget(const ExpenseTrackerApp());
      await tester.pumpAndSettle();
      expect(find.text('No expenses yet. Add your first expense.'), findsOneWidget);
    });

    testWidgets('validates the form and saves a valid expense', (tester) async {
      await tester.pumpWidget(const ExpenseTrackerApp());
      await tester.pumpAndSettle();

      // Open Add Expense from the floating button.
      await tester.tap(find.byType(FloatingActionButton));
      await tester.pumpAndSettle();

      // Test 2: empty form shows validation messages.
      await tester.tap(find.byKey(const Key('saveButton')));
      await tester.pumpAndSettle();
      expect(find.text('Expense title cannot be empty'), findsOneWidget);
      expect(find.text('Amount cannot be empty'), findsOneWidget);
      expect(find.text('Please select a category'), findsOneWidget);

      // Zero, negative and invalid amounts.
      await tester.enterText(find.byKey(const Key('amountField')), '0');
      await tester.tap(find.byKey(const Key('saveButton')));
      await tester.pumpAndSettle();
      expect(find.text('Amount must be greater than zero'), findsOneWidget);

      await tester.enterText(find.byKey(const Key('amountField')), '-5');
      await tester.tap(find.byKey(const Key('saveButton')));
      await tester.pumpAndSettle();
      expect(find.text('Amount must be greater than zero'), findsOneWidget);

      await tester.enterText(find.byKey(const Key('amountField')), 'abc');
      await tester.tap(find.byKey(const Key('saveButton')));
      await tester.pumpAndSettle();
      expect(find.text('Amount must be a number'), findsOneWidget);

      // Test 1: Lunch, ₹250, Food, today.
      await tester.enterText(find.byKey(const Key('titleField')), 'Lunch');
      await tester.enterText(find.byKey(const Key('amountField')), '250');
      await tester.tap(find.byKey(const Key('categoryField')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Food').last);
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const Key('saveButton')));
      await tester.pumpAndSettle();

      expect(find.text('Expense saved successfully.'), findsOneWidget);
      expect(find.text('Lunch'), findsWidgets);
      expect(find.text('₹250.00'), findsWidgets);
    });
  });
}
