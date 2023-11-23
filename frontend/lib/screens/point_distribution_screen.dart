import 'package:PointCollector/states/user_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user_model.dart';

class PointDistributionScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Future<User> user = ref.watch(userProvider);

    return FutureBuilder<User>(
      future: user,
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return Text('UserList(ref: ref, snapshot: snapshot);');
        } else if (snapshot.hasError) {
          return const Center(
              child: Text(
                  'There was an error loading the data. Please try again later.'));
        }
        return const Center(
          child: CircularProgressIndicator(),
        );
      },
    );
  }
}
