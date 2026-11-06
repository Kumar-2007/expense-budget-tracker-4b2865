/// The list of categories the user can choose from.
const List<String> kCategories = [
  'Food',
  'Travel',
  'Shopping',
  'Education',
  'Bills',
  'Other',
];

/// One expense record.
///
/// Every expense has a unique [id] so we can find and delete it later.
class Expense {
  final String id;
  final String title;
  final double amount;
  final String category;
  final DateTime date;
  final String note;

  const Expense({
    required this.id,
    required this.title,
    required this.amount,
    required this.category,
    required this.date,
    this.note = '',
  });

  /// Creates a simple unique ID from the current time (in microseconds).
  /// This is unique enough for a single-user local app.
  static String generateId() =>
      DateTime.now().microsecondsSinceEpoch.toString();

  /// Converts this expense into a Map so it can be stored as JSON.
  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'amount': amount,
        'category': category,
        'date': date.toIso8601String(),
        'note': note,
      };

  /// Rebuilds an expense from a JSON Map that was saved earlier.
  factory Expense.fromJson(Map<String, dynamic> json) {
    return Expense(
      id: json['id'] as String,
      title: json['title'] as String,
      amount: (json['amount'] as num).toDouble(),
      category: json['category'] as String,
      date: DateTime.parse(json['date'] as String),
      note: (json['note'] as String?) ?? '',
    );
  }
}

/// Formats a number as Indian Rupees, e.g. 12500.5 -> "₹12,500.50".
///
/// Uses Indian digit grouping: 125000 -> "₹1,25,000.00".
String formatRupees(double value) {
  final isNegative = value < 0;
  final parts = value.abs().toStringAsFixed(2).split('.');
  final whole = parts[0];
  final decimals = parts[1];

  String grouped;
  if (whole.length <= 3) {
    grouped = whole;
  } else {
    // Last three digits, then groups of two (Indian system).
    final lastThree = whole.substring(whole.length - 3);
    var rest = whole.substring(0, whole.length - 3);
    final groups = <String>[];
    while (rest.length > 2) {
      groups.insert(0, rest.substring(rest.length - 2));
      rest = rest.substring(0, rest.length - 2);
    }
    if (rest.isNotEmpty) groups.insert(0, rest);
    grouped = '${groups.join(',')},$lastThree';
  }
  return '${isNegative ? '-' : ''}₹$grouped.$decimals';
}

const _monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/// Formats a date like "6 Nov 2026".
String formatDate(DateTime date) =>
    '${date.day} ${_monthNames[date.month - 1]} ${date.year}';
