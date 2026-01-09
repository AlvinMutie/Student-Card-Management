import 'package:dynamic_color/dynamic_color.dart';
import 'package:flutter/material.dart';
import 'package:shule_inadvantage/app/routes/app_router.dart';
import 'package:shule_inadvantage/app/theme/app_theme.dart';
import 'package:shule_inadvantage/app/providers/theme_provider.dart';
import 'package:provider/provider.dart';
import 'package:shule_inadvantage/features/auth/presentation/providers/auth_provider.dart';
import 'package:shule_inadvantage/features/dashboard/presentation/models/visitor.dart';

import 'package:shule_inadvantage/features/qr_scan/presentation/providers/scan_history_provider.dart';
import 'package:shule_inadvantage/core/services/user_preferences_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await UserPreferencesService().init();
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => VisitorProvider()),
        ChangeNotifierProvider(create: (_) => ScanHistoryProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, child) {
        return DynamicColorBuilder(
          builder: (lightDynamic, darkDynamic) {
            return MaterialApp.router(
              title: 'Shuleni Advantage Staff Portal',
              debugShowCheckedModeBanner: false,
              theme: AppTheme.lightTheme.copyWith(
                colorScheme: lightDynamic ?? AppTheme.lightTheme.colorScheme,
              ),
              darkTheme: AppTheme.darkTheme.copyWith(
                colorScheme: darkDynamic ?? AppTheme.darkTheme.colorScheme,
              ),
              themeMode: themeProvider.themeMode,
              themeAnimationDuration: const Duration(milliseconds: 300),
              themeAnimationCurve: Curves.easeInOut,
              routerConfig: AppRouter.router,
              builder: (context, child) {
                return GestureDetector(
                  onTap: () {
                    FocusManager.instance.primaryFocus?.unfocus();
                  },
                  child: child,
                );
              },
            );
          },
        );
      },
    );
  }
}
