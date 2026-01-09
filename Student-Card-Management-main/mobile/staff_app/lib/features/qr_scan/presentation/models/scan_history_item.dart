import 'package:shule_inadvantage/features/dashboard/presentation/models/visitor.dart';
import 'package:shule_inadvantage/features/student/presentation/models/student.dart';

enum ScanType { student, visitor }

class ScanHistoryItem {
  final String id;
  final ScanType type;
  final String name;
  final String identifier; // Admission No or National ID
  final DateTime timestamp;
  final Student? student;
  final Visitor? visitor;

  ScanHistoryItem({
    required this.id,
    required this.type,
    required this.name,
    required this.identifier,
    required this.timestamp,
    this.student,
    this.visitor,
  });

  factory ScanHistoryItem.fromStudent(Student student) {
    return ScanHistoryItem(
      id: 'student-${student.id}-${DateTime.now().millisecondsSinceEpoch}',
      type: ScanType.student,
      name: student.name,
      identifier: student.admissionNumber,
      timestamp: DateTime.now(),
      student: student,
    );
  }

  factory ScanHistoryItem.fromVisitor(Visitor visitor) {
    return ScanHistoryItem(
      id: 'visitor-${visitor.id}-${DateTime.now().millisecondsSinceEpoch}',
      type: ScanType.visitor,
      name: visitor.name,
      identifier: visitor.nationalId,
      timestamp: DateTime.now(),
      visitor: visitor,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.name,
      'name': name,
      'identifier': identifier,
      'timestamp': timestamp.toIso8601String(),
      'student': student?.toJson(),
      'visitor': visitor?.toJson(),
    };
  }

  factory ScanHistoryItem.fromJson(Map<String, dynamic> json) {
    return ScanHistoryItem(
      id: json['id'],
      type: ScanType.values.byName(json['type']),
      name: json['name'],
      identifier: json['identifier'],
      timestamp: DateTime.parse(json['timestamp']),
      student: json['student'] != null ? Student.fromJson(json['student']) : null,
      visitor: json['visitor'] != null ? Visitor.fromJson(json['visitor']) : null,
    );
  }
}
