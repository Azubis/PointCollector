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

    try {
      final response =
          await http.get(Uri.parse('https://pointcollector.onrender.com/api/businesses'));

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

  void setPoints(int businessId, int points) {
    _businesses.then((businesses) {
      final businessToUpdate = businesses.firstWhere((business) => business
          .id == businessId);

      businessToUpdate.points = points;

      // Notify listeners or update state if using a state management solution like Riverpod
      // For simplicity, let's assume you have a Riverpod provider for businesses
      // and it's a NotifierProvider<BusinessNotifier, List<Business>>.

      // Replace the following line with your actual state management approach
      // businessProvider.notifier.setPoints(businessToUpdate);

      // If using Riverpod, you can do something like:
      // read(businessProvider).setPoints(businessId, points);
    });
  }

  Future<Business> fetchBusinessById(int id) {
    return _businesses.then((businesses) {
      return businesses.firstWhere((business) => business.id == id, orElse:
          () => throw Exception('Business with id $id not found'));
    });
    }

  Future<List<Business>> saveSingleBusiness(Business updatedBusiness) {
    return _businesses.then((businesses) {
      final updatedList = businesses.map((existingBusiness) {
        if (existingBusiness.id == updatedBusiness.id) {
          // Create a new instance with updated information
          return updatedBusiness;
        } else {
          return existingBusiness;
        }
      }).toList();
      return _businesses = Future.value(updatedList);
    });
  }

}
