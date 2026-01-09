import 'package:flutter/material.dart';

class StaggeredSlide extends StatelessWidget {
  final Widget child;
  final int index;
  final Duration delay;
  final Duration duration;
  final Offset offset;

  const StaggeredSlide({
    super.key,
    required this.child,
    required this.index,
    this.delay = const Duration(milliseconds: 50),
    this.duration = const Duration(milliseconds: 400),
    this.offset = const Offset(0, 20),
  });

  @override
  Widget build(BuildContext context) {
    // Animations deactivated for performance optimization
    return child;
  }
}
