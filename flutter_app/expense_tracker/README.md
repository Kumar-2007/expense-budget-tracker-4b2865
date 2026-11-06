# Personal Expense Tracker (Flutter · Android)

A beginner-friendly Android app for recording daily expenses in Indian Rupees (₹). It was built as a college project for the KHIT Flutter Application Development Programme and is designed to be easy to read, explain and demonstrate.

## Features

- **Dashboard** – app name, this month's spending, total number of expenses, the five latest expenses and quick links to every screen.
- **Add Expense** – title, amount (₹), category dropdown, date picker (defaults to today) and an optional note, with full validation. The Save button is disabled while saving so an expense can't be saved twice. Shows *"Expense saved successfully."* on success.
- **Transactions** – every expense with its icon, title, category, date and amount, plus loading, error (with Retry), empty and data states.
- **Expense Details** – all fields of one expense and a **Delete Expense** button with a Cancel / Delete confirmation dialog.
- **Category Summary** – totals for Food, Travel, Shopping, Education, Bills and Other, plus the overall total. It updates as soon as an expense is added or deleted.
- **Saved on the phone** – expenses are stored with SharedPreferences, so they're still there after you close and reopen the app.

## Technology

| Part | Choice |
| --- | --- |
| Framework | Flutter 3.35+ (Material 3) |
| Language | Dart |
| State management | `provider` + `ChangeNotifier` |
| Local storage | `shared_preferences` (expenses saved as JSON) |

## Folder structure

```text
lib/
├── main.dart                       # App entry, theme, bottom navigation
├── models/expense.dart             # Expense model, toJson/fromJson, ₹ + date formatting
├── providers/expense_provider.dart # State: list, add, delete, totals, loading/error
├── services/expense_storage_service.dart # SharedPreferences load/save
├── screens/
│   ├── dashboard_screen.dart
│   ├── transactions_screen.dart
│   ├── add_expense_screen.dart
│   ├── expense_detail_screen.dart
│   └── summary_screen.dart
└── widgets/
    ├── expense_tile.dart           # One list row + category icons
    └── expense_state_view.dart     # Loading / error / empty message
test/widget_test.dart               # Model, provider, persistence and form tests
```

### How the pieces fit together

1. `main.dart` creates one `ExpenseProvider` and calls `loadExpenses()` when the app starts.
2. `ExpenseProvider` asks `ExpenseStorageService` to read the saved JSON list from SharedPreferences.
3. Screens call `context.watch<ExpenseProvider>()` so they rebuild automatically when expenses change.
4. Adding or deleting an expense saves the whole list first, then calls `notifyListeners()`, which refreshes the Dashboard, Transactions and Category Summary screens.

## Getting started

This folder contains the `lib/`, `test/` and `pubspec.yaml` files. Generate the Android platform folder once, then run the app:

```bash
cd expense_tracker
flutter create . --platforms=android --project-name expense_tracker   # creates android/ (keeps existing lib/ files)
flutter pub get
flutter run                                                           # with a phone or emulator connected
```

## Code quality

```bash
dart format .
flutter analyze
flutter test
```

## Build the release APK

```bash
flutter build apk --release
```

The APK is created at `build/app/outputs/flutter-apk/app-release.apk`. Copy it to an Android phone, allow "Install unknown apps" for your file manager, and install it.

## Manual test checklist

| # | Test | Steps | Expected result |
| --- | --- | --- | --- |
| 1 | Add expense | Add *Lunch*, *250*, *Food*, today → Save | "Expense saved successfully." and Lunch ₹250.00 appears on the Dashboard |
| 2 | Validation | Save an empty form; then try 0, -5 and `abc` as the amount | Clear messages for title, amount and category; nothing is saved |
| 3 | Transactions | Add several expenses → open Transactions | Every expense is listed, newest first |
| 4 | Details | Tap an expense | Title, amount, category, date and note are shown |
| 5 | Delete | Delete → **Cancel**, then Delete → **Delete** | Cancel keeps the record; Delete removes it |
| 6 | Persistence | Add expenses → close the app fully → reopen | Expenses are still listed |
| 7 | Category summary | Add Food ₹500, Travel ₹250, Shopping ₹300, Bills ₹150 | Each total matches and the overall total is ₹1,200.00 |

Tests 1, 2 and 7, and the persistence logic from test 6, are also automated in `test/widget_test.dart`.

## Defect log (template)

| ID | Date | Screen | Description | Steps to reproduce | Severity | Status | Fixed by |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D-01 | | | | | | Open | |

## Five-minute demo outline

1. (0:30) Introduce the app and the problem it solves.
2. (1:00) Dashboard: monthly total, expense count, recent list, navigation.
3. (1:30) Add Expense: show validation errors, then save *Lunch ₹250*.
4. (1:00) Transactions → Details → Delete (Cancel first, then Delete).
5. (0:30) Category Summary updating live.
6. (0:30) Close and reopen the app to prove the data is saved.

## Team

| Member | GitHub | Responsibilities |
| --- | --- | --- |
| Member 1 | `your-username` | Dashboard, app theme, navigation (`main.dart`, `dashboard_screen.dart`) |
| Member 2 | `your-username` | Add Expense form, validation, Expense Details, delete (`add_expense_screen.dart`, `expense_detail_screen.dart`) |
| Member 3 | `your-username` | Expense model, provider, SharedPreferences, Transactions, Category Summary, testing (`models/`, `providers/`, `services/`, `transactions_screen.dart`, `summary_screen.dart`, `test/`) |

Replace the placeholders with your names and GitHub usernames, and add screenshots to a `screenshots/` folder once the app is running on your phone.
