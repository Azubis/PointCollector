import 'package:PointCollector/screens/home_screen.dart';
import 'package:PointCollector/screens/profile_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../states/riverpod_states.dart';

class Navigation extends ConsumerWidget {

  @override
  Widget build(BuildContext context, WidgetRef ref) {

    Widget currentPage = ref.watch(currentPageProvider);
    int currentScaffoldIndex = ref.watch(currentScaffoldIndexProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('PointCollector'),
      ),
      bottomNavigationBar: NavigationBar(
        onDestinationSelected: (int index){
          ref.read(currentScaffoldIndexProvider.notifier).setCurrentScaffoldIndex(index);
          if (index == 0) {
            ref.read(currentPageProvider.notifier).setCurrentPage(HomeScreen());
          } else if (index == 1) {
            ref.read(currentPageProvider.notifier).setCurrentPage(ProfileScreen());
          }
        },
        indicatorColor: Colors.amber[800],
        selectedIndex: currentScaffoldIndex,
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
      body: [
        currentPage,
        ProfileScreen()
      ][currentScaffoldIndex],
    );
  }
}
