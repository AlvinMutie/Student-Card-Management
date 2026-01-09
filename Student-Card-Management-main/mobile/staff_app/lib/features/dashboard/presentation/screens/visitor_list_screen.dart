import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shule_inadvantage/features/dashboard/presentation/models/visitor.dart';
import 'package:go_router/go_router.dart';
import 'package:shule_inadvantage/app/routes/app_router.dart';
import 'package:shule_inadvantage/features/auth/presentation/providers/auth_provider.dart';
import 'package:shule_inadvantage/core/presentation/widgets/staggered_slide.dart';
import 'package:shule_inadvantage/core/presentation/widgets/glass_card.dart';
import 'package:shule_inadvantage/app/theme/app_theme.dart';

class VisitorListScreen extends StatefulWidget {
  const VisitorListScreen({super.key});

  @override
  State<VisitorListScreen> createState() => _VisitorListScreenState();
}

class _VisitorListScreenState extends State<VisitorListScreen> {
  String _searchQuery = '';
  bool _isSearching = false;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<VisitorProvider>().fetchVisitors();
    });
  }

  @override
  Widget build(BuildContext context) {
    final visitorProvider = context.watch<VisitorProvider>();
    final visitors = visitorProvider.searchVisitors(_searchQuery);
    final userRole = context.read<AuthProvider>().user?['role']?.toString().toLowerCase() ?? 'staff';

    return Scaffold(
      appBar: AppBar(
        title: _isSearching
            ? TextField(
                controller: _searchController,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'Search by Name, ID, or Phone...',
                  border: InputBorder.none,
                  hintStyle: TextStyle(
                    color: Theme.of(context).appBarTheme.foregroundColor?.withValues(alpha: 0.6),
                  ),
                ),
                style: TextStyle(
                  color: Theme.of(context).appBarTheme.foregroundColor,
                ),
                onChanged: (value) => setState(() => _searchQuery = value),
              )
            : const Text('Visitor Records'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(_isSearching ? Icons.close : Icons.search),
            onPressed: () {
              setState(() {
                if (_isSearching) {
                  _isSearching = false;
                  _searchQuery = '';
                  _searchController.clear();
                } else {
                  _isSearching = true;
                }
              });
            },
          ),
          if (userRole == 'admin' || userRole == 'guard')
            IconButton(
              icon: const Icon(Icons.add),
              onPressed: () => context.push(AppRouter.visitorCheckIn),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => context.read<VisitorProvider>().fetchVisitors(),
        child: visitors.isEmpty
            ? _buildEmptyState(context, userRole)
            : ListView.builder(
                padding: const EdgeInsets.only(top: 8, bottom: 24),
                itemCount: visitors.length,
                itemBuilder: (context, index) {
                  final visitor = visitors[index];
                  return StaggeredSlide(
                    index: index,
                    child: _buildVisitorCard(context, visitor, userRole),
                  );
                },
              ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, String role) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.people_outline,
              size: 80, color: Theme.of(context).disabledColor.withValues(alpha: 0.2)),
          const SizedBox(height: 16),
          Text(
            _searchQuery.isEmpty ? 'No visitors today' : 'No results found',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Theme.of(context).disabledColor,
                ),
          ),
          if (_searchQuery.isEmpty && (role == 'admin' || role == 'guard')) ...[
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => context.push(AppRouter.visitorCheckIn),
              icon: const Icon(Icons.add),
              label: const Text('Check In Visitor'),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildVisitorCard(BuildContext context, Visitor visitor, String role) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        title: Text(
          visitor.name,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text('ID: ${visitor.nationalId} • ${visitor.phoneNumber}'),
            Text('To visit: ${visitor.personVisited}', 
                 style: const TextStyle(fontStyle: FontStyle.italic, fontSize: 13)),
          ],
        ),
        trailing: _buildStatusChip(visitor.status),
        onTap: () => _showVisitorDetails(context, visitor, role),
      ),
    );
  }

  Widget _buildStatusChip(VisitorStatus status) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: _getStatusColor(status).withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: _getStatusColor(status).withValues(alpha: 0.5)),
      ),
      child: Text(
        status.name.toUpperCase(),
        style: TextStyle(
          color: _getStatusColor(status),
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Color _getStatusColor(VisitorStatus status) {
    switch (status) {
      case VisitorStatus.waiting:
        return Colors.orange;
      case VisitorStatus.approved:
        return Colors.green;
      case VisitorStatus.rejected:
        return Colors.red;
      case VisitorStatus.checkedOut:
        return Colors.blueGrey;
    }
  }

  void _showVisitorDetails(BuildContext context, Visitor visitor, String userRole) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          maxChildSize: 0.9,
          minChildSize: 0.4,
          expand: false,
          builder: (context, scrollController) {
            return SingleChildScrollView(
              controller: scrollController,
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(visitor.name,
                                style: const TextStyle(
                                    fontSize: 24, fontWeight: FontWeight.bold)),
                            Text('Status: ${visitor.status.name.toUpperCase()}',
                                style: TextStyle(
                                    color: _getStatusColor(visitor.status),
                                    fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  _buildDetailRow(Icons.badge_outlined, 'National ID', visitor.nationalId),
                  _buildDetailRow(Icons.phone_outlined, 'Phone Number', visitor.phoneNumber),
                  _buildDetailRow(Icons.meeting_room_outlined, 'Visiting', visitor.personVisited),
                  _buildDetailRow(Icons.info_outline, 'Purpose', visitor.purpose),
                  _buildDetailRow(Icons.access_time, 'Check-In', 
                      '${visitor.checkInTime.hour}:${visitor.checkInTime.minute.toString().padLeft(2, '0')}'),
                  if (visitor.checkOutTime != null)
                    _buildDetailRow(Icons.logout, 'Check-Out', 
                        '${visitor.checkOutTime!.hour}:${visitor.checkOutTime!.minute.toString().padLeft(2, '0')}'),
                  
                  const SizedBox(height: 32),
                  // Only Admin and Secretary can Approve/Reject currently
                  if (visitor.status == VisitorStatus.waiting && (userRole == 'admin' || userRole == 'secretary')) ...[
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {
                              context.read<VisitorProvider>().updateStatus(visitor.id, VisitorStatus.rejected);
                              Navigator.pop(context);
                            },
                            style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                            child: const Text('REJECT'),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              context.read<VisitorProvider>().updateStatus(visitor.id, VisitorStatus.approved);
                              Navigator.pop(context);
                            },
                            child: const Text('APPROVE'),
                          ),
                        ),
                      ],
                    ),
                  ],
                  // Admin and Guard can Check-Out
                  if (visitor.status == VisitorStatus.approved && (userRole == 'admin' || userRole == 'guard')) ...[
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.logout),
                        onPressed: () {
                          context.read<VisitorProvider>().updateStatus(visitor.id, VisitorStatus.checkedOut);
                          Navigator.pop(context);
                        },
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.blueGrey),
                        label: const Text('CHECK OUT VISITOR'),
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: Colors.grey),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
              Text(value, style: const TextStyle(fontSize: 16)),
            ],
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
