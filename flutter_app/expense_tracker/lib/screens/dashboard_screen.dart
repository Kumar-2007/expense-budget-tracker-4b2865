import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/expense.dart';
import '../providers/expense_provider.dart';
import '../widgets/expense_state_view.dart';
import '../widgets/expense_tile.dart';
import 'expense_detail_screen.dart';

/// Screen 1: Dashboard - this month's total, expense count and
/// the five most recent expenses.
class DashboardScreen extends StatelessWidget {
  const DashboardScreen({
    super.key,
    required this.onAddExpense,
    required this.onViewAll,
    required this.onViewSummary,
  });

  final VoidCallback onAddExpense;
  final VoidCallback onViewAll;
  final VoidCallback onViewSummary;

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ExpenseProvider>();
    final colors = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Personal Expense Tracker')),
      body: Builder(builder: (context) {
        if (provider.isLoading) return const ExpenseStateView.loading();
        if (provider.hasError) {
          return ExpenseStateView(
            icon: Icons.error_outline,
            message: provider.errorMessage!,
            actionLabel: 'Retry',
            onAction: provider.loadExpenses,
          );
        }

        final recent = provider.recentExpenses(5);
        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 96),
          children: [
            // Summary card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: colors.primary,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Spent this month',
                      style: textTheme.titleSmall
                          ?.copyWith(color: colors.onPrimary.withValues(alpha: 0.85))),
                  const SizedBox(height: 6),
                  Text(
                    formatRupees(provider.monthlySpending),
                    style: textTheme.headlineMedium?.copyWith(
                        color: colors.onPrimary, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Total expenses: ${provider.expenses.length}',
                    style: textTheme.bodyMedium?.copyWith(color: colors.onPrimary),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Quick navigation buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onViewAll,
                    icon: const Icon(Icons.receipt_long),
                    label: const Text('Transactions'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onViewSummary,
                    icon: const Icon(Icons.pie_chart),
                    label: const Text('Summary'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: onAddExpense,
              icon: const Icon(Icons.add),
              label: const Text('Add Expense'),
            ),
            const SizedBox(height: 24),

            Text('Recent expenses', style: textTheme.titleMedium),
            const SizedBox(height: 8),
            if (recent.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Center(
                  child: Text('No expenses yet. Add your first expense.'),
                ),
              )
            else
              ...recent.map(
                (expense) => ExpenseTile(
                  expense: expense,
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => ExpenseDetailScreen(expenseId: expense.id),
                    ),
                  ),
                ),
              ),
          ],
        );
      }),
    );
  }
}
