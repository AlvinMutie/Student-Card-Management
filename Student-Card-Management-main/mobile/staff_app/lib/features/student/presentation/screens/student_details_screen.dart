import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shule_inadvantage/app/routes/app_router.dart';
import 'package:shule_inadvantage/features/student/data/repositories/student_repository.dart';
import 'package:intl/intl.dart';
import 'package:shule_inadvantage/features/student/presentation/models/student.dart';
import 'package:shule_inadvantage/core/presentation/widgets/receipt_card.dart';
import 'package:provider/provider.dart';
import 'package:shule_inadvantage/features/auth/presentation/providers/auth_provider.dart';

class StudentDetailsScreen extends StatefulWidget {
  final String studentId;

  const StudentDetailsScreen({
    super.key,
    required this.studentId,
  });

  @override
  State<StudentDetailsScreen> createState() => _StudentDetailsScreenState();
}

class _StudentDetailsScreenState extends State<StudentDetailsScreen> {
  final StudentRepository _repository = StudentRepository();
  Student? _student;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchStudentDetails();
  }

  Future<void> _fetchStudentDetails() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final userId = context.read<AuthProvider>().user?['id']?.toString();
      final student = await _repository.lookupStudent(widget.studentId, scannedBy: userId);
      if (mounted) {
        setState(() {
          _student = student;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString().replaceFirst('ApiException: ', '');
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Error')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(_error!, style: const TextStyle(color: Colors.red)),
              const SizedBox(height: 16),
              ElevatedButton(onPressed: _fetchStudentDetails, child: const Text('RETRY')),
            ],
          ),
        ),
      );
    }

    final student = _student!;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset('assets/images/logo.png', height: 28),
            const SizedBox(width: 10),
            const Text('Student Details'),
          ],
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            ReceiptCard(
              title: 'Student Profile',
              subtitle: DateFormat('dd.MM.yyyy').format(DateTime.now()),
              items: {
                'Name': student.name,
                'Admission No.': student.admissionNumber,
                'Class': student.studentClass ?? 'N/A',
                'House': student.house ?? 'N/A',
                'Meal Validity': student.mealCardValidity?.toString() ?? 'N/A',
                'Fee Balance': 'KES ${student.feeBalance.toStringAsFixed(2)}',
              },
              totalLabel: 'Status',
              totalValue: student.status?.toUpperCase() ?? 'ACTIVE',
              statusColor: Colors.green,
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      // TODO: Implement view full profile
                    },
                    icon: const Icon(Icons.person_outline),
                    label: const Text('View Full Profile'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      side: const BorderSide(color: Colors.green),
                      foregroundColor: Colors.green,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Check-in recorded')),
                      );
                      context.go(AppRouter.dashboard);
                    },
                    icon: const Icon(Icons.check_circle_outline),
                    label: const Text('Check In'),
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: Colors.green,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailItem(
      BuildContext context, {
        required String label,
        required String value,
        bool isHighlighted = false,
      }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                fontWeight: isHighlighted ? FontWeight.bold : null,
                color: isHighlighted
                    ? Theme.of(context).colorScheme.error
                    : null,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
