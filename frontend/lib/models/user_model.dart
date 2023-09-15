import 'package:flutter/material.dart';
  // Your UserModel code here

class UserModel with ChangeNotifier {
  String name;
  String email;
  int points;

  UserModel({this.name = 'example name', this.email = 'name@example.com', this.points = 1000});

  VoidCallback? incrementPoints(int increment) {
    points += increment;
    notifyListeners();
  }
}
