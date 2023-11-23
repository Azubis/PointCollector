import 'dart:convert';

import 'package:PointCollector/models/user_model.dart';
import 'package:http/http.dart' as http;

// This Repository is a Singleton. It fetches user data from the backend
// ONCE. Has a factory constructor which always returns the same Instance of
// this class. Meaning you always work with the same data
// and only receive new user on a manual reload
class UserRepository {
  late Future<User> _user;
  bool _isLoaded = false;

  // the _singleton variable is initialized with an instance of the class
  static final UserRepository _singleton = UserRepository._internal();

  // The factory constructor always returns the same instance of the class
  factory UserRepository() {
    return _singleton;
  }

  // The internal constructor is only called once
  UserRepository._internal();

  Future<User> fetchUserById(int id) async {
    if (_isLoaded) {
      // If data is already fetched, return the cached result
      return _user;
    }

    try {
      final response =
          await http.get(Uri.parse('http://localhost:8080/api/user/$id'));

      if (response.statusCode == 200) {
        dynamic jsonData = json.decode(response.body);

        _user = Future.value(User.fromJson(jsonData));
        _isLoaded = true;

        return _user;
      } else {
        throw Exception('Failed to load user with id $id');
      }
    } catch (e) {
      throw Exception('Failed to load user with id $id: $e');
    }
  }

  void set isLoaded(bool value) => _isLoaded = value;
  Future<User> get user => _user;
}
