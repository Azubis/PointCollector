import 'package:PointCollector/repository/user_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user_model.dart';

class UserState extends StateNotifier<Future<User>> {
  UserState() : super(UserRepository().fetchUserById(0));

  void reloadUsers() {
    UserRepository().isLoaded = false;
    state = UserRepository().fetchUserById(0);
  }
}

final userProvider = StateNotifierProvider<UserState, Future<User>>((ref) {
  return UserState();
});
