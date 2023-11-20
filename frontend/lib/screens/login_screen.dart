import 'package:PointCollector/models/login_model.dart';
import 'package:flutter/material.dart';
import '../logger.util.dart';
import '../repository/BusinessRepository.dart';

class LoginScreen extends StatelessWidget {
  final log = getLogger();
  final TextEditingController identifierController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();


  @override
  Widget build(BuildContext context) {
    void _onLoginButtonPressed() async {
      final String identifier = identifierController.text;
      final String password = passwordController.text;

      final loginModel = LoginModel(identifier: identifier, password: password);
      log.d('identifier : $identifier');
      log.d('password : $password');

      log.d('loginModel : ${loginModel.toJson()}');
      await BusinessRepository().login(loginModel);



      // Hier sollte Ihre API-Anfrage erfolgen
      bool loginSuccessful = true;

      if (loginSuccessful) {
        Navigator.pushNamed(context, "/home");
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Login Screen'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              TextField(
                controller: identifierController,
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
                    onPressed: _onLoginButtonPressed,
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