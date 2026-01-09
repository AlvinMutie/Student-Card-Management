import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:shule_inadvantage/features/qr_scan/presentation/models/scan_history_item.dart';

class ScanHistoryProvider extends ChangeNotifier {
  static const String _storageKey = 'scan_history';
  final List<ScanHistoryItem> _items = [];
  bool _isLoading = false;

  List<ScanHistoryItem> get items => List.unmodifiable(_items);
  bool get isLoading => _isLoading;

  ScanHistoryProvider() {
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final String? historyJson = prefs.getString(_storageKey);
      
      if (historyJson != null) {
        final List<dynamic> decoded = jsonDecode(historyJson);
        _items.clear();
        _items.addAll(decoded.map((item) => ScanHistoryItem.fromJson(item)).toList());
        // Sort by timestamp descending
        _items.sort((a, b) => b.timestamp.compareTo(a.timestamp));
      }
    } catch (e) {
      debugPrint('Error loading scan history: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addScan(ScanHistoryItem item) async {
    _items.insert(0, item);
    // Keep only the last 100 scans
    if (_items.length > 100) {
      _items.removeLast();
    }
    notifyListeners();
    await _saveHistory();
  }

  Future<void> _saveHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String historyJson = jsonEncode(_items.map((item) => item.toJson()).toList());
      await prefs.setString(_storageKey, historyJson);
    } catch (e) {
      debugPrint('Error saving scan history: $e');
    }
  }

  Future<void> clearHistory() async {
    _items.clear();
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_storageKey);
  }
}
