import 'package:PointCollector/states/user_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_model.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Future<User> user = ref.watch(userProvider);

    return FutureBuilder<User>(
      future: user,
      builder: (context, snapshot) {
        User? userData = snapshot.data;

        if (snapshot.hasData) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Icon(
                  Icons.person,
                  size: 100, // Adjust the size as needed
                ),
                SizedBox(
                    height: 16), // Add spacing between the avatar and user info
                Text(
                  userData!.name,
                  style: TextStyle(
                    fontSize: 24, // Adjust the font size
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(
                    height: 8), // Add spacing between name and other details
                Text("Email: ${userData!.email}"),
                Text("City: ${userData!.city}"),
                Text("Address: ${userData!.address}"),
              ],
            ),
          );
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
