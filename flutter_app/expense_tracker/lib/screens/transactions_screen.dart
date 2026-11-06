import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/expense_provider.dart';
import '../widgets/expense_state_view.dart';
import '../widgets/expense_tile.dart';
import 'expense_detail_screen.dart';

/// Screen 2: Transactions - every saved expense, newest first.
/// Shows loading, error (with Retry), empty and data states.
class TransactionsScreen extends StatelessWidget {
  const TransactionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ExpenseProvider>();

    Widget body;
    if (provider.isLoading) {
      body = const ExpenseStateView.loading();
    } else if (provider.hasError) {
      body = ExpenseStateView(
        icon: Icons.error_outline,
        message: provider.errorMessage!,
        actionLabel: 'Retry',
        onAction: provider.loadExpenses,
      );
    } else if (provider.expenses.isEmpty) {
      body = const ExpenseStateView(
        icon: Icons.receipt_long_outlined,
        message: 'No expenses yet. Add your first expense.',
      );
    } else {
      final list = provider.expenses;
      body = ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 96),
        itemCount: list.length,
        itemBuilder: (context, index) {
          final expense = list[index];
          return ExpenseTile(
            expense: expense,
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => ExpenseDetailScreen(expenseId: expense.id),
              ),
            ),
          );
        },
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Transactions')),
      body: body,
    );
  }
}
