import 'package:PointCollector/screens/login_screen.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';
import 'package:PointCollector/screens/navigation.dart';
import 'package:flutter/material.dart';
import 'package:PointCollector/styles/global_theme.dart';

void main() {
  Logger.level = Level.debug;
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Point Collector',
      theme: globalTheme,
      home: Navigation(),
      routes: {
        '/login': (context) => Navigation(),
      },
      debugShowCheckedModeBanner: false,
    );
  }
}
