import 'package:shule_inadvantage/core/api/api_client.dart';
import 'package:shule_inadvantage/core/constants/constants.dart';
import 'package:shule_inadvantage/features/student/presentation/models/student.dart';
import 'dart:convert';

class StudentRepository {
  final ApiClient _apiClient = ApiClient();

  Future<Student> lookupStudent(String admissionNumber, {String? scannedBy}) async {
    final response = await _apiClient.post(
      AppConstants.studentLookupEndpoint,
      {
        'qrData': admissionNumber,
        'scannedBy': scannedBy ?? 'system',
      },
    );

    if (response.statusCode == 200) {
      final dynamic decodedResponse = jsonDecode(response.body);
      
      // Handle various response structures
      Student student;
      if (decodedResponse is Map<String, dynamic>) {
        if (decodedResponse.containsKey('student')) {
          student = Student.fromJson(decodedResponse['student']);
        } else if (decodedResponse.containsKey('data')) {
           final data = decodedResponse['data'];
           if (data is Map<String, dynamic> && data.containsKey('student')) {
             student = Student.fromJson(data['student']);
           } else {
             student = Student.fromJson(data);
           }
        } else {
          // Fallback: assume the root is the student object
          student = Student.fromJson(decodedResponse);
        }
      } else {
        throw ApiException('Invalid response format', statusCode: response.statusCode);
      }

      // If admission number is still N/A, use the scanned QR code
      if (student.admissionNumber == 'N/A' || student.admissionNumber.isEmpty) {
        return student.copyWith(admissionNumber: admissionNumber);
      }
      return student;
      
      throw ApiException('Invalid response format', statusCode: response.statusCode);
    } else {
      final data = jsonDecode(response.body);
      throw ApiException(data['message'] ?? 'Student lookup failed', statusCode: response.statusCode);
    }
  }
}
