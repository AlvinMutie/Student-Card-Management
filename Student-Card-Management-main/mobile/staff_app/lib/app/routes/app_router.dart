import 'package:animations/animations.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shule_inadvantage/features/auth/presentation/screens/login_screen.dart';
import 'package:shule_inadvantage/features/dashboard/presentation/screens/dashboard_screen.dart';
import 'package:shule_inadvantage/features/qr_scan/presentation/screens/scan_qr_screen.dart';
import 'package:shule_inadvantage/features/student/presentation/screens/student_details_screen.dart';
import 'package:shule_inadvantage/features/dashboard/presentation/screens/visitor_list_screen.dart';
import 'package:shule_inadvantage/features/dashboard/presentation/screens/settings_screen.dart';
import 'package:shule_inadvantage/features/auth/presentation/screens/splash_screen.dart';
import 'package:shule_inadvantage/features/dashboard/presentation/screens/visitor_checkin_screen.dart';
import 'package:shule_inadvantage/features/qr_scan/presentation/screens/scan_history_screen.dart';
import 'package:shule_inadvantage/features/dashboard/presentation/screens/placeholder_screen.dart';

class AppRouter {
  static const String splash = '/';
  static const String login = '/login';
  static const String dashboard = '/dashboard';
  static const String scanQr = '/scan-qr';
  static const String studentDetails = '/student-details';
  static const String visitorList = '/visitor-list';
  static const String visitorCheckIn = '/visitor-checkin';
  static const String scanHistory = '/scan-history';
  static const String settings = '/settings';

  static final router = GoRouter(
    initialLocation: splash,
    routes: [
      GoRoute(
        path: splash,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: login,
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const LoginScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return SharedAxisTransition(
              animation: animation,
              secondaryAnimation: secondaryAnimation,
              transitionType: SharedAxisTransitionType.horizontal,
              child: child,
            );
          },
        ),
      ),
      GoRoute(
        path: dashboard,
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const DashboardScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return SharedAxisTransition(
              animation: animation,
              secondaryAnimation: secondaryAnimation,
              transitionType: SharedAxisTransitionType.horizontal,
              child: child,
            );
          },
        ),
      ),
      GoRoute(
        path: scanQr,
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const ScanQrScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return SharedAxisTransition(
              animation: animation,
              secondaryAnimation: secondaryAnimation,
              transitionType: SharedAxisTransitionType.horizontal,
              child: child,
            );
          },
        ),
      ),
      GoRoute(
        path: '$studentDetails/:studentId',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: StudentDetailsScreen(
            studentId: state.pathParameters['studentId'] ?? '',
          ),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return SharedAxisTransition(
              animation: animation,
              secondaryAnimation: secondaryAnimation,
              transitionType: SharedAxisTransitionType.horizontal,
              child: child,
            );
          },
        ),
      ),
      GoRoute(
        path: visitorList,
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const VisitorListScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return SharedAxisTransition(
              animation: animation,
              secondaryAnimation: secondaryAnimation,
              transitionType: SharedAxisTransitionType.horizontal,
              child: child,
            );
          },
        ),
      ),
      GoRoute(
        path: visitorCheckIn,
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const VisitorCheckInScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return SharedAxisTransition(
              animation: animation,
              secondaryAnimation: secondaryAnimation,
              transitionType: SharedAxisTransitionType.horizontal,
              child: child,
            );
          },
        ),
      ),
      GoRoute(
        path: scanHistory,
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const ScanHistoryScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return SharedAxisTransition(
              animation: animation,
              secondaryAnimation: secondaryAnimation,
              transitionType: SharedAxisTransitionType.horizontal,
              child: child,
            );
          },
        ),
      ),
      GoRoute(
        path: settings,
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const SettingsScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return SharedAxisTransition(
              animation: animation,
              secondaryAnimation: secondaryAnimation,
              transitionType: SharedAxisTransitionType.horizontal,
              child: child,
            );
          },
        ),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Route not found: ${state.uri.path}'),
      ),
    ),
  );
}
