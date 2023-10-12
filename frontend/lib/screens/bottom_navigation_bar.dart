import 'package:PointCollector/screens/home_screen.dart';
import 'package:PointCollector/screens/profile_screen.dart';
import 'package:flutter/material.dart';

import '../models/user_model.dart';

//Navigation holds a widget in State to Display as body, to ensure that all the
// screens share the same Scaffold
class Navigation extends StatefulWidget {

  final Widget body;

  Navigation({required this.body});

  @override
  _NavigationState createState() => _NavigationState();
}


class _NavigationState extends State<Navigation> {
  int selectedIndex = 0;

  UserModel loadUserData() {
    // Load your user data here
    return UserModel.getUser();
  }

  void handleDestinationSelected(int index) {
    setState(() {
      selectedIndex = index;
    });

    if (index == 0) {
      Navigator.of(context).pushNamed('/mainScreen');
    } else if (index == 1) {
      Navigator.of(context).pushNamed('/profileScreen', arguments: loadUserData());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('PointCollector'),
      ),
      body: widget.body,
      bottomNavigationBar: NavigationBar(
        onDestinationSelected: handleDestinationSelected,
        selectedIndex: selectedIndex,
        destinations: const <Widget>[
          NavigationDestination(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
