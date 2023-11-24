import 'package:PointCollector/screens/home_screen.dart';
import 'package:PointCollector/screens/profile_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../states/riverpod_states.dart';

class Navigation extends ConsumerWidget {
  List<Widget> navigation = [
    HomeScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Widget currentScreen = ref.watch(currentScreenProvider);
    int currentScaffoldIndex = ref.watch(currentScaffoldIndexProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('PointCollector'),
        automaticallyImplyLeading: false,
        backgroundColor: Theme.of(context).primaryColor,
      ),
      bottomNavigationBar: NavigationBar(
          onDestinationSelected: (int index) {
            ref
                .read(currentScaffoldIndexProvider.notifier)
                .setCurrentScaffoldIndex(index);
            ref
                .read(currentScreenProvider.notifier)
                .setCurrentScreen(navigation[index]);
          },
          indicatorColor: Colors.amber[800],
          selectedIndex: currentScaffoldIndex,
          destinations: [
            NavigationDestination(
              icon: Icon(Icons.home),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.person),
              label: 'Profile',
            ),
          ]),
      body: [currentScreen, ProfileScreen()][currentScaffoldIndex],
    );
  }
}
