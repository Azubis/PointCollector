import 'package:flutter/material.dart';

class LoginModel with ChangeNotifier {
  String identifier;
  String password;

  LoginModel(
      {this.identifier = "",
      this.password = ""});

  Map<String, dynamic> toJson() {
    return {
      'identifier': identifier,
      'password': password,
    };
  }
}
