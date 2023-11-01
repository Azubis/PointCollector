import 'package:flutter/material.dart';

class LoginModel with ChangeNotifier {
  String name;
  String email;
  String password;

  LoginModel(
      {this.name = 'example name',
      this.email = 'name@example.com',
      this.password = ""});
}
