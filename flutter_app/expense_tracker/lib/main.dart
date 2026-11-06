import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'providers/expense_provider.dart';
import 'screens/add_expense_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/summary_screen.dart';
import 'screens/transactions_screen.dart';

void main() {
  runApp(const ExpenseTrackerApp());
}

/// The root widget. It creates the [ExpenseProvider] once and loads
/// saved expenses straight away.
class ExpenseTrackerApp extends StatelessWidget {
  const ExpenseTrackerApp({super.key, this.provider});

  /// Optional provider, used by tests to inject their own instance.
  final ExpenseProvider? provider;

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<ExpenseProvider>(
      create: (_) => (provider ?? ExpenseProvider())..loadExpenses(),
      child: MaterialApp(
        title: 'Personal Expense Tracker',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1E63E9)),
          scaffoldBackgroundColor: const Color(0xFFF6F8FC),
          cardTheme: CardThemeData(
            elevation: 0,
            color: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          inputDecorationTheme: InputDecorationTheme(
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            filled: true,
            fillColor: Colors.white,
          ),
        ),
        home: const HomeShell(),
      ),
    );
  }
}

/// Holds the bottom navigation bar and switches between the three
/// main tabs. Add Expense and Expense Details open on top as new pages.
class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _currentIndex = 0;

  void _goToTab(int index) => setState(() => _currentIndex = index);

  void _openAddExpense() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const AddExpenseScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      DashboardScreen(
        onAddExpense: _openAddExpense,
        onViewAll: () => _goToTab(1),
        onViewSummary: () => _goToTab(2),
      ),
      const TransactionsScreen(),
      const SummaryScreen(),
    ];

    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: screens),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAddExpense,
        icon: const Icon(Icons.add),
        label: const Text('Add Expense'),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: _goToTab,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long),
            label: 'Transactions',
          ),
          NavigationDestination(
            icon: Icon(Icons.pie_chart_outline),
            selectedIcon: Icon(Icons.pie_chart),
            label: 'Summary',
          ),
        ],
      ),
    );
  }
}
