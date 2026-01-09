import 'package:flutter/services.dart';

/// A centralized service for triggering haptic feedback.
/// This ensures consistent tactile response throughout the app.
class HapticService {
  /// A very light tap, perfect for subtle interactions like clicking a toggle.
  static Future<void> light() async {
    await HapticFeedback.lightImpact();
  }

  /// A standard tap, good for primary buttons.
  static Future<void> medium() async {
    await HapticFeedback.mediumImpact();
  }

  /// A strong tap, used for significant actions like deletions or major state changes.
  static Future<void> heavy() async {
    await HapticFeedback.heavyImpact();
  }

  /// Feedback indicating a successful action (e.g., login, check-in).
  static Future<void> success() async {
    // Android doesn't have a specific 'success' feedback, so we simulate with a quick double light tap
    await HapticFeedback.lightImpact();
    await Future.delayed(const Duration(milliseconds: 50));
    await HapticFeedback.lightImpact();
  }

  /// Feedback indicating an error or failure.
  static Future<void> error() async {
    await HapticFeedback.vibrate();
  }

  /// Selection feedback, used for scrolling through pickers or lists.
  static Future<void> selection() async {
    await HapticFeedback.selectionClick();
  }
}
