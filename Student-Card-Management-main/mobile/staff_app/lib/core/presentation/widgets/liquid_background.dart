import 'package:flutter/material.dart';

class LiquidBackground extends StatelessWidget {
  final Widget child;
  const LiquidBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark 
            ? [
                colorScheme.surface,
                colorScheme.surfaceVariant.withOpacity(0.5),
              ]
            : [
                colorScheme.surface,
                colorScheme.primaryContainer.withOpacity(0.12),
              ],
        ),
      ),
      child: child,
    );
  }
}
