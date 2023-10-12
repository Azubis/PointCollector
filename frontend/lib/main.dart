import 'package:PointCollector/screens/detail_screen.dart';
import 'package:PointCollector/screens/home_screen.dart';
import 'package:PointCollector/screens/login_screen.dart';
import 'package:PointCollector/screens/profile_screen.dart';
import 'package:logger/logger.dart';
import 'package:PointCollector/screens/bottom_navigation_bar.dart';
import 'package:flutter/material.dart';

import 'models/business_model.dart';
import 'models/user_model.dart';


void main() {
  Logger.level = Level.debug;
  runApp(MyApp());
}

class MyApp extends StatelessWidget {

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Navigation Bar',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        fontFamily: 'Manrope',
      ),
      initialRoute: '/loginScreen',
      routes: {
        '/loginScreen': (context) => LoginScreen(),
        '/mainScreen': (context) => Navigation(body: HomeScreen()),

        '/profileScreen': (context) => Navigation(body: ProfileScreen(user:
        ModalRoute.of(context)!.settings.arguments as UserModel)),

        '/detailScreen': (context) {
          final business = ModalRoute.of(context)!.settings.arguments as Business;
          return Navigation(body: DetailScreen(business: business));
        },
      },
      debugShowCheckedModeBanner: false,
    );
  }
}


