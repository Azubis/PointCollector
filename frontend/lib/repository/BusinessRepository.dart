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

  // the _singleton variable is initialized with an instance of the class
  static final BusinessRepository _singleton = BusinessRepository._internal();

  // The factory constructor always returns the same instance of the class
  factory BusinessRepository() {
    return _singleton;
  }

  // The internal constructor is only called once
  BusinessRepository._internal();

  Future<List<Business>> fetchBusinesses() async {
    if (_isLoaded) {
      // If data is already fetched, return the cached result
      return _businesses;
    }

    Future<List<Business>> getBusinesses() async {
      List<Business> businesses = [
        Business("1", "Supermart", "123 Market Street", "10115"),
        Business("2", "Electro World", "456 Tech Avenue", "10777"),
        Business("3", "Fashion Trend", "789 Style Boulevard", "12103"),
        Business("4", "Gadget Haven", "321 Tech Road", "13127"),
        Business("5", "Book Nook", "567 Literary Lane", "10555"),
        Business("6", "Sport Zone", "876 Active Avenue", "12045"),
        Business("7", "Home Decor Emporium", "432 Interior Street", "10988"),
        Business("8", "Pet Paradise", "789 Pet Park Place", "12233"),
        Business("9", "Bakery Delights", "101 Sweet Street", "10876"),
      ];

      await Future.delayed(Duration(seconds: 1)); // Simulate async operation

      return businesses;
    }

    _businesses = getBusinesses();
    _isLoaded = true;

    return _businesses;

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

  void set isLoaded(bool value) => _isLoaded = value;
  Future<List<Business>> get businesses => _businesses;
}
