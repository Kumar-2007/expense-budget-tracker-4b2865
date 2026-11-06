import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/expense.dart';
import '../providers/expense_provider.dart';
import '../widgets/expense_state_view.dart';
import '../widgets/expense_tile.dart';

/// Screen 5: Category Summary - total spending per category and overall.
/// Updates automatically because it watches the provider.
class SummaryScreen extends StatelessWidget {
  const SummaryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ExpenseProvider>();
    final colors = Theme.of(context).colorScheme;

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
    } else {
      final totals = provider.categoryTotals;
      final overall = provider.totalSpending;
      body = ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 96),
        children: [
          Card(
            color: colors.primaryContainer,
            child: ListTile(
              title: const Text('Overall total'),
              subtitle: Text('${provider.expenses.length} expenses'),
              trailing: Text(
                formatRupees(overall),
                key: const Key('overallTotal'),
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(height: 8),
          ...kCategories.map((category) {
            final total = totals[category] ?? 0;
            final share = overall > 0 ? total / overall : 0.0;
            return Card(
              margin: const EdgeInsets.symmetric(vertical: 4),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Icon(categoryIcon(category), color: colors.primary),
                        const SizedBox(width: 12),
                        Expanded(child: Text(category)),
                        Text(
                          formatRupees(total),
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    LinearProgressIndicator(
                      value: share,
                      minHeight: 6,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ],
                ),
              ),
            );
          }),
        ],
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Category Summary')),
      body: body,
    );
  }
}
