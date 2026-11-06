import 'package:flutter/material.dart';

/// A centred message used for loading, error and empty states.
class ExpenseStateView extends StatelessWidget {
  const ExpenseStateView({
    super.key,
    required this.icon,
    required this.message,
    this.actionLabel,
    this.onAction,
    this.isLoading = false,
  });

  /// Shortcut for the loading state.
  const ExpenseStateView.loading({super.key})
      : icon = Icons.hourglass_empty,
        message = 'Loading expenses...',
        actionLabel = null,
        onAction = null,
        isLoading = true;

  final IconData icon;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (isLoading)
              const CircularProgressIndicator()
            else
              Icon(icon, size: 56, color: colors.primary),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 16),
              FilledButton(onPressed: onAction, child: Text(actionLabel!)),
            ],
          ],
        ),
      ),
    );
  }
}
