import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shule_inadvantage/app/routes/app_router.dart';
import 'package:shule_inadvantage/app/theme/app_theme.dart';
import 'package:dotlottie_flutter/dotlottie_flutter.dart';
import 'package:provider/provider.dart';
import 'package:shule_inadvantage/features/auth/presentation/providers/auth_provider.dart';
import 'package:shule_inadvantage/core/services/haptic_service.dart';
import 'package:shule_inadvantage/core/presentation/widgets/liquid_background.dart';
import 'package:shule_inadvantage/core/presentation/widgets/glass_card.dart';
import 'package:shule_inadvantage/core/presentation/widgets/staggered_slide.dart';
import 'package:intl/intl.dart';
import 'package:shule_inadvantage/features/qr_scan/presentation/providers/scan_history_provider.dart';
import 'package:shule_inadvantage/features/qr_scan/presentation/models/scan_history_item.dart';
import 'package:shule_inadvantage/features/dashboard/presentation/models/visitor.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;
    final role = user?['role']?.toString().toLowerCase() ?? 'staff';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Staff Portal'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, size: 22),
            onPressed: () {
              HapticService.light();
              context.push(AppRouter.settings);
            },
          ),
        ],
      ),
      body: LiquidBackground(
        child: NotificationListener<ScrollNotification>(
          onNotification: (notification) => true,
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: AppTheme.defaultPadding),
            child: Column(
              children: [
                const SizedBox(height: 24),
                _buildParallaxHeader(context, role, user?['name'] ?? 'Staff'),
                const SizedBox(height: 32),
                _buildLivePulseStats(context, role),
                const SizedBox(height: 32),
                _buildDashboardGrid(context, role),
                const SizedBox(height: 40),
                _buildLiveRecentActivity(context, role),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildParallaxHeader(BuildContext context, String role, String name) {
    return StaggeredSlide(
      index: 0,
      child: Column(
        children: [
        SizedBox(
          height: 180,
          width: 180,
          child: DotLottieView(
            source: _getRoleLottie(role),
            sourceType: 'url',
            autoplay: true,
            loop: true,
            speed: 3.0,
          ),
        ),
          const SizedBox(height: 24),
          Text(
            'Hello, $name',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              letterSpacing: -1,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 4),
          Text(
            'Everything looks clear today.',
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  String _getRoleLottie(String role) {
    switch (role) {
      case 'guard':
      case 'security':
        return 'https://lottie.host/1d3dfde3-397e-4308-a3fe-5bc758fbbbcf/LVe264pYFX.lottie'; // Guard
      case 'teacher':
      case 'staff':
      case 'admin':
        return 'https://lottie.host/ba067cfb-501c-4140-9187-dc643d92a578/RjRiSb1oWp.lottie'; // Teacher
      default:
        return 'https://lottie.host/ba067cfb-501c-4140-9187-dc643d92a578/RjRiSb1oWp.lottie';
    }
  }

  Widget _buildLivePulseStats(BuildContext context, String role) {
    return StaggeredSlide(
      index: 1,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: Consumer2<ScanHistoryProvider, VisitorProvider>(
          builder: (context, scanHistory, visitorProvider, _) {
            final todayScans = scanHistory.items.where((i) {
              final now = DateTime.now();
              return i.timestamp.day == now.day && 
                     i.timestamp.month == now.month && 
                     i.timestamp.year == now.year;
            }).length;

            final activeVisitors = visitorProvider.activeVisitors.length;
            
            final isGuard = role == 'guard' || role == 'security';

            return Row(
              children: [
                if (!isGuard)
                  _StatCard(
                    label: 'Summary',
                    value: todayScans.toString(),
                    subtitle: 'Recent activity tracked',
                    icon: Icons.qr_code_scanner_rounded,
                    color: Colors.blue.shade400,
                  )
                else
                  _StatCard(
                    label: 'Presence',
                    value: activeVisitors.toString(),
                    subtitle: 'Active Visitors\nCurrent visitors on site',
                    icon: Icons.people_outline_rounded,
                    color: Colors.orange.shade400,
                  ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildDashboardGrid(BuildContext context, String role) {
    final items = _getDashboardItems(role);
    
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.1,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return StaggeredSlide(
          index: index + 2,
          child: _DashboardItem(
            index: index + 2,
            title: item['title'],
            icon: item['icon'],
            onTap: () => context.push(item['route']),
          ),
        );
      },
    );
  }

  Widget _buildLiveRecentActivity(BuildContext context, String role) {
    return StaggeredSlide(
      index: 5,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 16),
            child: Text(
              'Live Presence',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
          ),
          Consumer2<ScanHistoryProvider, VisitorProvider>(
            builder: (context, scanHistory, visitorProvider, _) {
              final List<_ActivityData> combinedActions = [];
              
              for (var i = 0; i < scanHistory.items.take(3).length; i++) {
                final item = scanHistory.items[i];
                combinedActions.add(_ActivityData(
                  title: item.name,
                  subtitle: '${item.type.name.toUpperCase()} Scan • ${DateFormat('HH:mm').format(item.timestamp)}',
                  icon: item.type == ScanType.student ? Icons.school_outlined : Icons.person_outline,
                  color: item.type == ScanType.student ? Colors.purple.shade400 : Colors.blue.shade400,
                  time: item.timestamp,
                ));
              }

              for (var i = 0; i < visitorProvider.visitors.take(3).length; i++) {
                final v = visitorProvider.visitors[i];
                combinedActions.add(_ActivityData(
                  title: v.name,
                  subtitle: 'Visitor • ${v.status.name.toUpperCase()} • ${DateFormat('HH:mm').format(v.checkInTime)}',
                  icon: Icons.person_add_outlined,
                  color: Colors.orange.shade400,
                  time: v.checkInTime,
                ));
              }

              combinedActions.sort((a, b) => b.time.compareTo(a.time));
              final displayList = combinedActions.take(3).toList();

              if (displayList.isEmpty) {
                return GlassCard(
                  padding: const EdgeInsets.all(32),
                  child: Center(
                    child: Text(
                      'No recent activity to show.',
                      style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5)),
                    ),
                  ),
                );
              }

              return GlassCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    for (var i = 0; i < displayList.length; i++) ...[
                      _ActivityRow(
                        title: displayList[i].title,
                        subtitle: displayList[i].subtitle,
                        icon: displayList[i].icon,
                        color: displayList[i].color,
                      ),
                      if (i < displayList.length - 1) const Divider(height: 32, thickness: 0.5),
                    ],
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  List<Map<String, dynamic>> _getDashboardItems(String role) {
    final List<Map<String, dynamic>> items = [];

    if (role == 'admin' || role == 'staff' || role == 'teacher') {
      items.add({
        'icon': Icons.qr_code_scanner_rounded,
        'title': 'Scan Student',
        'route': AppRouter.scanQr,
      });
    }

    if (role == 'admin' || role == 'guard' || role == 'secretary') {
      items.add({
        'icon': Icons.person_add_alt_1_rounded,
        'title': 'Check In',
        'route': AppRouter.visitorCheckIn,
      });
      items.add({
        'icon': Icons.people_alt_rounded,
        'title': 'Records',
        'route': AppRouter.visitorList,
      });
    }

    if (role == 'admin' || role == 'staff' || role == 'teacher') {
      items.add({
        'icon': Icons.history_rounded,
        'title': 'History',
        'route': AppRouter.scanHistory,
      });
    }

    return items;
  }
}

class _ActivityData {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final DateTime time;

  _ActivityData({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.time,
  });
}

class _WavyPainter extends CustomPainter {
  final Color color;
  _WavyPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final path = Path();
    for (var i = 0; i < 5; i++) {
      path.reset();
      path.moveTo(0, size.height * (0.6 + i * 0.1));
      path.quadraticBezierTo(
        size.width * 0.3,
        size.height * (0.3 + i * 0.1),
        size.width * 0.6,
        size.height * (0.5 + i * 0.1),
      );
      path.quadraticBezierTo(
        size.width * 0.8,
        size.height * (0.7 + i * 0.1),
        size.width,
        size.height * (0.4 + i * 0.1),
      );
      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.label,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 200,
      height: 120,
      margin: const EdgeInsets.only(right: 12),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          children: [
            // Dark Background
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A1A),
                borderRadius: BorderRadius.circular(24),
              ),
            ),
            
            // Wavy Pattern
            Positioned.fill(
              child: CustomPaint(
                painter: _WavyPainter(
                  color: Colors.white.withOpacity(0.05),
                ),
              ),
            ),

            // Content
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        label,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          letterSpacing: -0.5,
                        ),
                      ),
                      Text(
                        value,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.9),
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  Text(
                    subtitle,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.5),
                      fontSize: 13,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActivityRow extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;

  const _ActivityRow({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, size: 18, color: color),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
              ),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 12,
                  color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                ),
              ),
            ],
          ),
        ),
        Icon(
          Icons.chevron_right_rounded,
          size: 18,
          color: Theme.of(context).colorScheme.onSurface.withOpacity(0.3),
        ),
      ],
    );
  }
}

class _DashboardItem extends StatefulWidget {
  final int index;
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _DashboardItem({
    required this.index,
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  State<_DashboardItem> createState() => _DashboardItemState();
}

class _DashboardItemState extends State<_DashboardItem> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) {
        setState(() => _isPressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _isPressed = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeInOut,
        transform: Matrix4.identity()..scale(_isPressed ? 0.96 : 1.0),
        child: GlassCard(
          padding: EdgeInsets.zero,
          color: _isPressed 
              ? Theme.of(context).colorScheme.primary.withOpacity(0.1)
              : null,
          border: _isPressed 
              ? Border.all(color: Theme.of(context).colorScheme.primary, width: 1.5)
              : null,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                widget.icon,
                size: 32,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 12),
              Text(
                widget.title,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: Theme.of(context).colorScheme.onSurface,
                  letterSpacing: -0.2,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
