import 'package:PointCollector/states/riverpod_states.dart';
import 'package:flutter/material.dart';
import 'package:PointCollector/models/business_model.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'detail_screen.dart';

class HomeScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Future<List<Business>> business = ref.watch(businessProvider);

    return FutureBuilder<List<Business>>(
      future: business,
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return Center(
            child: RefreshIndicator(
              //refresh on pull down calls setState and rebuilds the UI with
              // the new data
              onRefresh: () async {
                ref.read(businessProvider.notifier).reloadBusinesses();
              },
              //ListView.separated is used to display a list of the fetched data
              child: ListView.separated(
                padding: const EdgeInsets.all(8),
                itemCount: snapshot.data!.length,
                itemBuilder: (BuildContext context, int index) {
                  return InkWell(
                    onTap: () {
                      ref.read(currentPageProvider.notifier).setCurrentPage(
                          DetailScreen(business: snapshot.data![index]));
                    },
                    child: Container(
                      height: 100,
                      color: Colors.blue[100],
                      child: Center(
                          child: Text(snapshot.data![index].name,
                              style: const TextStyle(fontSize: 18))),
                    ),
                  );
                },
                separatorBuilder: (BuildContext context, int index) =>
                    const Divider(),
              ),
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
