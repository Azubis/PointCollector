import 'package:flutter/material.dart';

class UserModel extends ChangeNotifier {
  String name;
  String email;
  int points;

  UserModel({this.name = 'example name', this.email = 'name@example.com', this.points = 1000});
}
