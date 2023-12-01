import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:PointCollector/models/login_model.dart';
import '../logger.util.dart';
import '../repository/BusinessRepository.dart';
import 'package:http/http.dart' as http;

class LoginScreen extends StatelessWidget {
  final log = getLogger();
  final TextEditingController usernameController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  Future<bool> login(LoginModel loginModel) async {
    final url = Uri.parse('http://localhost:8080/api/user/login');
    final headers = {
      'Content-Type': 'application/json',
      // Weitere Header, die Sie benötigen, wie z.B. Auth-Token
    };

    final body = json.encode(loginModel);

    final response = await http.post(url, headers: headers, body: body);
    log.d('response: ' + response.toString());
    if (response.statusCode == 200) {
      // Erfolgreiche Anfrageverarbeitung
      return true;
    } else {
      // Anfrage fehlgeschlagen, verarbeiten Sie Fehlermeldungen hier
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    void _onLoginButtonPressed() async {
      final String username = usernameController.text;
      final String password = passwordController.text;


      final loginModel = LoginModel(identifier: username, password: password);

      log.d('_onLoginButtonPressed');

      // Hier sollte Ihre API-Anfrage erfolgen
      final loginSuccessful = await login(loginModel);

      if (loginSuccessful) {
        Navigator.pushNamed(context, "/home");
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Login Screen'),
        backgroundColor: Theme.of(context).primaryColor,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              TextField(
                controller: usernameController,
                decoration: InputDecoration(
                  labelText: 'Username',
                ),
              ),
              SizedBox(height: 16.0),
              TextField(
                controller: passwordController,
                obscureText: true, // Hide password
                decoration: InputDecoration(
                  labelText: 'Password',
                ),
              ),
              SizedBox(height: 16.0),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: <Widget>[
                  ElevatedButton(
                    onPressed: () => {
                      _onLoginButtonPressed()
                    },
                    child: Text('Login'),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      // Hier können Sie die Registrierungslogik implementieren
                    },
                    child: Text('Registrieren'),
                  ),
                ],
              ),
              SizedBox(height: 16.0),
              TextButton(
                onPressed: () {
                  // Hier können Sie die "Passwort vergessen" -Logik implementieren
                },
                child: Text('Passwort vergessen'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}