import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/expense.dart';
import '../providers/expense_provider.dart';
import '../widgets/expense_tile.dart';

/// Screen 4: Expense Details - shows every field and lets the user
/// delete the expense after confirming.
class ExpenseDetailScreen extends StatelessWidget {
  const ExpenseDetailScreen({super.key, required this.expenseId});

  final String expenseId;

  Future<void> _confirmDelete(BuildContext context, Expense expense) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Delete expense?'),
        content: Text('"${expense.title}" will be removed permanently.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(dialogContext).colorScheme.error,
            ),
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    // Only delete when the user pressed "Delete".
    if (confirmed != true || !context.mounted) return;

    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);
    try {
      await context.read<ExpenseProvider>().deleteExpense(expense.id);
      messenger.showSnackBar(const SnackBar(content: Text('Expense deleted.')));
      navigator.pop();
    } catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    final expense = context.watch<ExpenseProvider>().findById(expenseId);
    final colors = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    if (expense == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Expense Details')),
        body: const Center(child: Text('This expense no longer exists.')),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Expense Details')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: colors.primaryContainer,
                    child: Icon(categoryIcon(expense.category),
                        color: colors.onPrimaryContainer, size: 28),
                  ),
                  const SizedBox(height: 16),
                  Text(expense.title, style: textTheme.headlineSmall),
                  const SizedBox(height: 4),
                  Text(
                    formatRupees(expense.amount),
                    style: textTheme.headlineMedium?.copyWith(
                        color: colors.primary, fontWeight: FontWeight.bold),
                  ),
                  const Divider(height: 32),
                  _DetailRow(
                      icon: Icons.category,
                      label: 'Category',
                      value: expense.category),
                  _DetailRow(
                      icon: Icons.calendar_today,
                      label: 'Date',
                      value: formatDate(expense.date)),
                  _DetailRow(
                      icon: Icons.notes,
                      label: 'Note',
                      value: expense.note.isEmpty ? 'No note' : expense.note),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: () => _confirmDelete(context, expense),
            icon: Icon(Icons.delete, color: colors.error),
            label: Text('Delete Expense', style: TextStyle(color: colors.error)),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size.fromHeight(52),
              side: BorderSide(color: colors.error),
            ),
          ),
        ],
      ),
    );
  }
}

/// A label/value row used on the details card.
class _DetailRow extends StatelessWidget {
  const _DetailRow(
      {required this.icon, required this.label, required this.value});

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: Theme.of(context).colorScheme.outline),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: Theme.of(context).textTheme.labelMedium),
                Text(value, style: Theme.of(context).textTheme.bodyLarge),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
