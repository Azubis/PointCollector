import 'package:PointCollector/screens/home_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class CurrentScreenState extends StateNotifier<Widget> {
  CurrentScreenState() : super(HomeScreen());
  void setCurrentScreen(Widget currentScreen) => state = currentScreen;
}

final currentScreenProvider =
    StateNotifierProvider<CurrentScreenState, Widget>((ref) {
  return CurrentScreenState();
});

class CurrentScaffoldIndexState extends StateNotifier<int> {
  CurrentScaffoldIndexState() : super(0);
  void setCurrentScaffoldIndex(int index) => state = index;
}

final currentScaffoldIndexProvider =
    StateNotifierProvider<CurrentScaffoldIndexState, int>((ref) {
  return CurrentScaffoldIndexState();
});
