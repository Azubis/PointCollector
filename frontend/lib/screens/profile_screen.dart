import 'package:flutter/material.dart';
import '../models/user_model.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key, required this.user}) : super(key: key);

  final UserModel user;

  @override
  Widget build(BuildContext context) {
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
