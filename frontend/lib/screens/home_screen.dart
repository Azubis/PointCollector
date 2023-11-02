import 'package:PointCollector/states/riverpod_states.dart';
import 'package:PointCollector/widgets/business_list_widget.dart';
import 'package:flutter/material.dart';
import 'package:PointCollector/models/business_model.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class HomeScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Future<List<Business>> business = ref.watch(businessProvider);

    return FutureBuilder<List<Business>>(
      future: business,
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return BusinessList(ref: ref, snapshot: snapshot);
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
