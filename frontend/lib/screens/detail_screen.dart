import 'package:flutter/material.dart';
import 'package:PointCollector/models/business_model.dart';

class DetailScreen extends StatefulWidget {
  late final Business business;

  DetailScreen({required this.business});

  @override
  State<StatefulWidget> createState() {
    return _DetailScreenState();
  }
}

class _DetailScreenState extends State<DetailScreen> {

  @override
  Widget build(BuildContext context) {
    Business business = widget.business; // Access the Business object

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Name: ${business.name}',
            style: TextStyle(fontSize: 18),
          ),
          SizedBox(height: 10),
          Text(
            'Address: ${business.address}',
            style: TextStyle(fontSize: 16),
          ),
          SizedBox(height: 10),
          Text(
            'Zip Code: ${business.zipCode}',
            style: TextStyle(fontSize: 16),
          ),
          SizedBox(height: 10),
          Text(
            'Points: ${business.points.toString()}',
            style: TextStyle(fontSize: 16),
          ),
        ],
      ),
    );
  }
}
