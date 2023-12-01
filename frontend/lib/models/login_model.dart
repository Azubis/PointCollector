import 'package:flutter/material.dart';

class LoginModel with ChangeNotifier {
  String identifier;
  String email;
  String password;

  LoginModel({
      this.identifier = 'example name',
      this.email = 'name@example.com',
      this.password = ""
  });

  Map toJson() => {
    'identifier': identifier,
    'email': email,
    'password': password,
  };
}
