import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:PointCollector/models/user_model.dart';
import 'homepage/home_page.dart';
import 'profile_page/profile_page.dart';

void main() {
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
  int _currentIndex = 0;
  late final List<Widget> _pages = [
    HomePage(),
    ProfilePage(userModel: widget.userModel),
  ];

  void _onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Navigation Bar',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: Scaffold(
        body: _pages[_currentIndex],
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _onTabTapped,
          items: [
            BottomNavigationBarItem(
              icon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.account_circle),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}

