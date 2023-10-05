import 'package:logger/logger.dart';
import 'package:PointCollector/screens/login_screen.dart';
import 'package:PointCollector/screens/main_screen.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:PointCollector/models/user_model.dart';

void main() {
  Logger.level = Level.debug;
  runApp(
      ChangeNotifierProvider(
          create: (context) => UserModel(),
          child: Consumer<UserModel>(
            builder: (_, userModel, __) => MyApp(userModel),
          )
      )
  );
}

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();

  final UserModel userModel;
  MyApp(this.userModel);
}

class _MyAppState extends State<MyApp> {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Navigation Bar',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: LoginScreen(),
      routes: {
        '/login': (context) => LoginScreen(),
        '/mainScreen': (context) => MainScreen(),
      },
      debugShowCheckedModeBanner: false,
    );
  }
}

