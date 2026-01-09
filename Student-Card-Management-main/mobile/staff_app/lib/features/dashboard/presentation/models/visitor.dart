import 'package:flutter/material.dart';
import 'package:shule_inadvantage/features/dashboard/data/repositories/visitor_repository.dart';

enum VisitorStatus { waiting, approved, rejected, checkedOut }

class Visitor {
  final String id;
  final String name;
  final String nationalId;
  final String phoneNumber;
  final String purpose;
  final String personVisited;
  final DateTime checkInTime;
  final DateTime? checkOutTime;
  final VisitorStatus status;
  final String? processedBy;

  Visitor({
    required this.id,
    required this.name,
    required this.nationalId,
    required this.phoneNumber,
    required this.purpose,
    required this.personVisited,
    required this.checkInTime,
    this.status = VisitorStatus.waiting,
    this.checkOutTime,
    this.processedBy,
  });

  Visitor copyWith({
    String? id,
    String? name,
    String? nationalId,
    String? phoneNumber,
    String? purpose,
    String? personVisited,
    DateTime? checkInTime,
    DateTime? checkOutTime,
    VisitorStatus? status,
    String? processedBy,
  }) {
    return Visitor(
      id: id ?? this.id,
      name: name ?? this.name,
      nationalId: nationalId ?? this.nationalId,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      purpose: purpose ?? this.purpose,
      personVisited: personVisited ?? this.personVisited,
      checkInTime: checkInTime ?? this.checkInTime,
      checkOutTime: checkOutTime ?? this.checkOutTime,
      status: status ?? this.status,
      processedBy: processedBy ?? this.processedBy,
    );
  }

  factory Visitor.fromJson(Map<String, dynamic> json) {
    return Visitor(
      id: (json['id'] ?? '').toString(),
      name: json['name'] ?? 'N/A',
      nationalId: json['national_id'] ?? json['nationalId'] ?? json['id_number'] ?? json['idNumber'] ?? json['id_no'] ?? 'N/A',
      phoneNumber: json['phone_number'] ?? json['phoneNumber'] ?? json['phone'] ?? json['mobile'] ?? json['telephone'] ?? 'N/A',
      purpose: json['purpose'] ?? 'N/A',
      personVisited: json['person_visited'] ?? json['personVisited'] ?? json['visiting'] ?? json['host'] ?? json['visit_to'] ?? 'N/A',
      checkInTime: json['check_in_time'] != null 
          ? DateTime.parse(json['check_in_time'])
          : (json['checkInTime'] != null ? DateTime.parse(json['checkInTime']) : DateTime.now()),
      checkOutTime: json['check_out_time'] != null 
          ? DateTime.parse(json['check_out_time']) 
          : (json['checkOutTime'] != null ? DateTime.parse(json['checkOutTime']) : null),
      status: VisitorStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => VisitorStatus.waiting,
      ),
      processedBy: json['processed_by'] ?? json['processedBy'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'nationalId': nationalId,
      'phoneNumber': phoneNumber,
      'purpose': purpose,
      'personVisited': personVisited,
      'checkInTime': checkInTime.toIso8601String(),
      'checkOutTime': checkOutTime?.toIso8601String(),
      'status': status.name,
      'processedBy': processedBy,
    };
  }
  bool get isValid => status == VisitorStatus.approved;
}


class VisitorProvider extends ChangeNotifier {
  final VisitorRepository _repository = VisitorRepository();
  final List<Visitor> _visitors = [];
  bool _isLoading = false;
  String? _error;

  List<Visitor> get visitors => List.unmodifiable(_visitors);
  bool get isLoading => _isLoading;
  String? get error => _error;

  List<Visitor> get activeVisitors => _visitors.where((v) => v.status != VisitorStatus.checkedOut).toList();

  Future<void> fetchVisitors() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final visitors = await _repository.getVisitors();
      _visitors.clear();
      _visitors.addAll(visitors);
      _statusUpdateSuccess();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void _statusUpdateSuccess() {
    // Helper to notify listeners after successful API action
  }

  Future<void> addVisitor(Visitor visitor) async {
    // This is now handled by registerWalkIn but keeping for local state if needed
    _visitors.insert(0, visitor);
    notifyListeners();
  }

  Future<bool> updateStatus(String id, VisitorStatus status, {String? processedBy}) async {
    try {
      Visitor updatedVisitor;
      if (status == VisitorStatus.checkedOut) {
        updatedVisitor = await _repository.checkOut(id);
      } else if (status == VisitorStatus.approved) {
        updatedVisitor = await _repository.approveVisitor(id);
      } else if (status == VisitorStatus.rejected) {
        updatedVisitor = await _repository.rejectVisitor(id);
      } else {
        return false;
      }

      final index = _visitors.indexWhere((v) => v.id == id);
      if (index != -1) {
        _visitors[index] = updatedVisitor;
        notifyListeners();
      }
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<Visitor?> verifyVisitor(String qrData) async {
    try {
      final visitor = await _repository.verifyQRCode(qrData);
      // If it's a new visitor or update, add/update in list
      final index = _visitors.indexWhere((v) => v.id == visitor.id);
      if (index != -1) {
        _visitors[index] = visitor;
      } else {
        _visitors.insert(0, visitor);
      }
      notifyListeners();
      return visitor;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<Visitor?> registerWalkIn(Map<String, dynamic> data) async {
    try {
      final visitor = await _repository.registerWalkIn(data);
      _visitors.insert(0, visitor);
      notifyListeners();
      return visitor;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  List<Visitor> searchVisitors(String query) {
    if (query.isEmpty) return _visitors;
    final lowercaseQuery = query.toLowerCase();
    return _visitors.where((v) {
      return v.name.toLowerCase().contains(lowercaseQuery) ||
             v.nationalId.toLowerCase().contains(lowercaseQuery) ||
             v.phoneNumber.toLowerCase().contains(lowercaseQuery);
    }).toList();
  }
}
