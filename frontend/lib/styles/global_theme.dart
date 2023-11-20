import 'package:flutter/material.dart';

var primaryColorLight = Colors.blue[100];

ThemeData globalTheme = ThemeData(
  primaryColor: Colors.blue[500],
  primaryColorLight: primaryColorLight,
  scaffoldBackgroundColor: Colors.white,
  appBarTheme: AppBarTheme(
    backgroundColor: primaryColorLight,
    titleTextStyle: TextStyle(
      color: Colors.white,
      fontSize: 20,
      fontWeight: FontWeight.bold,
    ),
  ),
  textTheme: TextTheme(
    bodyText2: TextStyle(
      color: Colors.black,
      fontSize: 16,
    ),
  ),
);
