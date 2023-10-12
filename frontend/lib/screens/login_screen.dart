import 'package:flutter/material.dart';
import '../logger.util.dart';


class LoginScreen extends StatelessWidget {
  final log = getLogger();

  @override
  Widget build(BuildContext context) {

    void _onLoginButtonPressed() {
      log.d('_onLoginButtonPressed');

      bool loginSuccessful = true; // Replace with your actual login logic

      if (loginSuccessful) {
        Navigator.of(context).pushReplacementNamed('/mainScreen');
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
              const TextField(
                decoration: InputDecoration(
                  labelText: 'Username',
                ),
              ),
              SizedBox(height: 16.0),
              const TextField(
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
                    onPressed: () {
                      _onLoginButtonPressed();
                    },
                    child: Text('Login'),
                  ),
                  ElevatedButton(
                    onPressed: () {
                    },
                    child: Text('Registrieren'),
                  ),
                ],
              ),
              SizedBox(height: 16.0),
              TextButton(
                onPressed: () {
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
