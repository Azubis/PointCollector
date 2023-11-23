import 'package:PointCollector/screens/home_screen.dart';
import 'package:PointCollector/screens/point_distribution_screen.dart';
import 'package:PointCollector/screens/profile_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../states/current_screen_state.dart';

class Navigation extends ConsumerWidget {
  List<Widget> navigation = [
    HomeScreen(),
    PointDistributionScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    int currentScaffoldIndex = ref.watch(currentScaffoldIndexProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('PointCollector'),
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
              icon: Icon(Icons.control_point),
              label: 'Point Distribution',
            ),
            NavigationDestination(
              icon: Icon(Icons.person),
              label: 'Profile',
            ),
          ]),
      body: navigation[currentScaffoldIndex],
    );
  }
}
