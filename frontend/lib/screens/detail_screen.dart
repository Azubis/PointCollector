import 'package:PointCollector/states/riverpod_states.dart';
import 'package:PointCollector/widgets/buy_tab.dart';
import 'package:PointCollector/widgets/detailScreenTabController.dart';
import 'package:PointCollector/widgets/overview_tab.dart';
import 'package:flutter/material.dart';
import 'package:PointCollector/models/business_model.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/product_model.dart';
import '../widgets/redeem_tab.dart';

class DetailScreen extends ConsumerWidget {
  late final Product product;

  DetailScreen();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Future<Business> business = ref.watch(singleBusinessProvider);
    return FutureBuilder(
        future: business,
        builder: (context, snapshot) {
        if (snapshot.hasData) {
          return DetailScreenTabController(snapshot: snapshot);
        } else if (snapshot.hasError) {
          return const Center(
              child: Text(
                  'There was an error loading the data. Please try again later.'));
        }
        return const Center(
          child: CircularProgressIndicator(),
        );
    });
  }
}
