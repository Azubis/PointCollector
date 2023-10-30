import 'package:PointCollector/screens/login_screen.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';
import 'package:PointCollector/screens/bottom_navigation_bar.dart';
import 'package:flutter/material.dart';

void main() {
  Logger.level = Level.debug;
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Navigation Bar',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        fontFamily: 'Manrope',
      ),
      home: LoginScreen(),
      routes: {
        '/home': (context) => Navigation(),
      },
      debugShowCheckedModeBanner: false,
    );
  }
}
