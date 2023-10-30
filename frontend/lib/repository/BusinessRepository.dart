import 'dart:convert';

import 'package:PointCollector/models/business_model.dart';
import 'package:http/http.dart' as http;

// This Repository is a Singleton. It fetches business data from the backend
// ONCE. Has a factory constructor which always returns the same Instance of
// this class. Meaning you always work with the same data
// and only receive new businesses on a manual reload
class BusinessRepository {
  late Future<List<Business>> _businesses;
  bool _isLoaded = false;

  //the _singleton variable is initialized with an instance of the class
  static final BusinessRepository _singleton = BusinessRepository._internal();

  //The factory constructor always returns the same instance of the class
  factory BusinessRepository() {
    return _singleton;
  }

  //The internal constructor is only called once
  BusinessRepository._internal();

  Future<List<Business>> fetchBusinesses() async {
    if (_isLoaded) {
      // If data is already fetched, return the cached result
      return _businesses;
    }

    try {
      final response =
          await http.get(Uri.parse('http://localhost:8080/api/businesses'));

      if (response.statusCode == 200) {
        List<dynamic> jsonData = json.decode(response.body);

        _businesses = Future.value(Business.fromJsonList(jsonData));
        _isLoaded = true;

        return _businesses;
      } else {
        throw Exception('Failed to load businesses');
      }
    } catch (e) {
      throw Exception('Failed to load businesses: $e');
    }
  }

  //getter and setter
  void set isLoaded(bool value) => _isLoaded = value;
  Future<List<Business>> get businesses => _businesses;
}
