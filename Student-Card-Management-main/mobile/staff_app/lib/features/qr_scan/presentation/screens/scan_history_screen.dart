import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:shule_inadvantage/features/qr_scan/presentation/providers/scan_history_provider.dart';
import 'package:shule_inadvantage/features/qr_scan/presentation/models/scan_history_item.dart';
import 'package:shule_inadvantage/core/presentation/widgets/staggered_slide.dart';
import 'package:shule_inadvantage/core/presentation/widgets/glass_card.dart';

class ScanHistoryScreen extends StatelessWidget {
  const ScanHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan History'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_sweep_outlined),
            onPressed: () => _showClearDialog(context),
            tooltip: 'Clear History',
          ),
        ],
      ),
      body: Consumer<ScanHistoryProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.items.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.history, size: 80, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  const Text(
                    'No scan history yet',
                    style: TextStyle(fontSize: 18, color: Colors.grey),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: provider.items.length,
            itemBuilder: (context, index) {
              final item = provider.items[index];
              return StaggeredSlide(
                index: index,
                child: _buildHistoryCard(context, item),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildHistoryCard(BuildContext context, ScanHistoryItem item) {
    final bool isStudent = item.type == ScanType.student;
    
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: isStudent ? Colors.green.withValues(alpha: 0.1) : Colors.blue.withValues(alpha: 0.1),
          child: Icon(
            isStudent ? Icons.school_outlined : Icons.person_outline,
            color: isStudent ? Colors.green : Colors.blue,
          ),
        ),
        title: Text(
          item.name,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(
          '${isStudent ? "Adm No" : "ID"}: ${item.identifier}\n${DateFormat('dd MMM yyyy, HH:mm').format(item.timestamp)}',
        ),
        isThreeLine: true,
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: isStudent ? Colors.green.withValues(alpha: 0.1) : Colors.blue.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            item.type.name.toUpperCase(),
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: isStudent ? Colors.green.darken() : Colors.blue.darken(),
            ),
          ),
        ),
      ),
    );
  }

  void _showClearDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear History'),
        content: const Text('Are you sure you want to delete all scan history?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('CANCEL'),
          ),
          TextButton(
            onPressed: () {
              context.read<ScanHistoryProvider>().clearHistory();
              Navigator.pop(context);
            },
            child: const Text('CLEAR', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}

extension ColorExtension on Color {
  Color darken([double amount = .1]) {
    assert(amount >= 0 && amount <= 1);
    final hls = HSVColor.fromColor(this);
    final hlsDark = hls.withValue((hls.value - amount).clamp(0.0, 1.0));
    return hlsDark.toColor();
  }
}
