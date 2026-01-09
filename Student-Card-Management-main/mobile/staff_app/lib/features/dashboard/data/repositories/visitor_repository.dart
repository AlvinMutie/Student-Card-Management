import 'dart:convert';
import 'package:shule_inadvantage/core/api/api_client.dart';
import 'package:shule_inadvantage/core/constants/constants.dart';
import 'package:shule_inadvantage/features/dashboard/presentation/models/visitor.dart';

class VisitorRepository {
  final ApiClient _apiClient = ApiClient();

  Future<List<Visitor>> getVisitors() async {
    final response = await _apiClient.get(AppConstants.visitorEndpoint);
    
    if (response.statusCode == 200) {
      final dynamic decodedResponse = jsonDecode(response.body);
      List<dynamic> data;
      
      if (decodedResponse is List) {
        data = decodedResponse;
      } else if (decodedResponse is Map<String, dynamic>) {
        if (decodedResponse.containsKey('visitors')) {
          data = decodedResponse['visitors'];
        } else if (decodedResponse.containsKey('data')) {
           final innerData = decodedResponse['data'];
           data = innerData is List ? innerData : [];
        } else {
          data = [];
        }
      } else {
        data = [];
      }
      
      return data.map((json) => Visitor.fromJson(json)).toList();
    } else {
      throw ApiException('Failed to fetch visitors', statusCode: response.statusCode);
    }
  }

  Future<Visitor> verifyQRCode(String token) async {
    final response = await _apiClient.get(
      '${AppConstants.visitorVerifyEndpoint}/$token',
    );

    if (response.statusCode == 200) {
      return _parseVisitorResponse(response.body);
    } else {
      final data = jsonDecode(response.body);
      throw ApiException(data['message'] ?? 'Invalid QR code', statusCode: response.statusCode);
    }
  }

  Future<Visitor> checkIn(String visitorId) async {
    final response = await _apiClient.post(
      AppConstants.visitorCheckInEndpoint,
      {'visitorId': visitorId},
    );

    if (response.statusCode == 200) {
      return _parseVisitorResponse(response.body);
    } else {
      throw ApiException('Failed to check in visitor', statusCode: response.statusCode);
    }
  }

  Future<Visitor> checkOut(String visitorId) async {
    final response = await _apiClient.put(
      '${AppConstants.visitorCheckOutEndpoint}/$visitorId',
      {},
    );

    if (response.statusCode == 200) {
      return _parseVisitorResponse(response.body);
    } else {
      throw ApiException('Failed to check out visitor', statusCode: response.statusCode);
    }
  }

  Future<Visitor> approveVisitor(String visitorId) async {
    final response = await _apiClient.put(
      '${AppConstants.visitorApproveEndpoint}/$visitorId',
      {},
    );

    if (response.statusCode == 200) {
      return _parseVisitorResponse(response.body);
    } else {
      throw ApiException('Failed to approve visitor', statusCode: response.statusCode);
    }
  }

  Future<Visitor> rejectVisitor(String visitorId) async {
    final response = await _apiClient.put(
      '${AppConstants.visitorRejectEndpoint}/$visitorId',
      {},
    );

    if (response.statusCode == 200) {
      return _parseVisitorResponse(response.body);
    } else {
      throw ApiException('Failed to reject visitor', statusCode: response.statusCode);
    }
  }

  Future<Visitor> registerWalkIn(Map<String, dynamic> visitorData) async {
    final response = await _apiClient.post(
      AppConstants.visitorRegisterEndpoint,
      visitorData,
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      final dynamic decodedResponse = jsonDecode(response.body);
      Map<String, dynamic> responseData = {};

      // Extract the relevant map from the response
      if (decodedResponse is Map<String, dynamic>) {
        if (decodedResponse.containsKey('visitor')) {
          responseData = decodedResponse['visitor'];
        } else if (decodedResponse.containsKey('data')) {
           final inner = decodedResponse['data'];
           if (inner is Map<String, dynamic>) {
             responseData = inner.containsKey('visitor') ? inner['visitor'] : inner;
           }
        } else {
          responseData = decodedResponse;
        }
      }

      // Merge: Input data overrides defaults, but Server data (like ID) overrides input.
      // We start with input data to ensure fields like name/phone are present.
      final combinedData = Map<String, dynamic>.from(visitorData);
      combinedData.addAll(responseData);

      return Visitor.fromJson(combinedData);
    } else {
      throw ApiException('Failed to register visitor', statusCode: response.statusCode);
    }
  }

  // Helper to parse single visitor response with flexible structure
  Visitor _parseVisitorResponse(String responseBody) {
    final dynamic decodedResponse = jsonDecode(responseBody);
      
    if (decodedResponse is Map<String, dynamic>) {
      if (decodedResponse.containsKey('visitor')) {
        return Visitor.fromJson(decodedResponse['visitor']);
      } else if (decodedResponse.containsKey('data')) {
          final data = decodedResponse['data'];
          if (data is Map<String, dynamic>) {
             if (data.containsKey('visitor')) {
               return Visitor.fromJson(data['visitor']);
             }
             return Visitor.fromJson(data);
          }
      }
      return Visitor.fromJson(decodedResponse);
    }
    throw const FormatException('Invalid visitor response format');
  }
}
