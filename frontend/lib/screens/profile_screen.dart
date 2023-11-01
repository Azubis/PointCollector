import 'package:PointCollector/states/riverpod_states.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_model.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    UserModel user = ref.watch(userProvider);

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Icon(
            Icons.person,
            size: 100, // Adjust the size as needed
          ),
          SizedBox(height: 16), // Add spacing between the avatar and user info
          Text(
            user.name,
            style: TextStyle(
              fontSize: 24, // Adjust the font size
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 8), // Add spacing between name and other details
          Text("Email: ${user.email}"),
          Text("City: ${user.city}"),
          Text("Address: ${user.address}"),
        ],
      ),
    );
  }
}
