import 'package:flutter/material.dart';

ThemeData globalTheme = ThemeData(
  primaryColor: Colors.orange[500],
  scaffoldBackgroundColor: Colors.white,
  appBarTheme: AppBarTheme(
    backgroundColor: Colors.orange[500],
    titleTextStyle: TextStyle(
      color: Colors.white,
      fontSize: 20,
      fontWeight: FontWeight.bold,
    ),
  ),
/*
  colorScheme: ColorScheme.light(
    primary: Colors.orange[500],
    secondary: Colors.orange[300],
  ),
*/
  textTheme: TextTheme(
    bodyText2: TextStyle(
      color: Colors.black,
      fontSize: 16,
    ),
  ),
);
