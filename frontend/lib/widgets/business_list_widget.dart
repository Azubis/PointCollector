import 'package:PointCollector/models/business_model.dart';
import 'package:PointCollector/screens/detail_screen.dart';
import 'package:PointCollector/states/riverpod_states.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class BusinessList extends StatelessWidget {
  final WidgetRef ref;
  final AsyncSnapshot<List<Business>> snapshot;

  BusinessList({
    required this.ref,
    required this.snapshot,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: RefreshIndicator(
        onRefresh: () async {
          ref.read(businessProvider.notifier).reloadBusinesses();
        },
        child: ListView.separated(
          padding: const EdgeInsets.all(8),
          itemCount: snapshot.data!.length,
          itemBuilder: (BuildContext context, int index) {
            return BusinessListItem(
              ref: ref,
              snapshot: snapshot,
              index: index,
            );
          },
          separatorBuilder: (BuildContext context, int index) =>
              const Divider(),
        ),
      ),
    );
  }
}

class BusinessListItem extends StatelessWidget {
  final WidgetRef ref;
  final AsyncSnapshot<List<Business>> snapshot;
  final int index;

  BusinessListItem({
    required this.ref,
    required this.snapshot,
    required this.index,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        ref.read(currentScreenProvider.notifier).setCurrentScreen(
              DetailScreen(business: snapshot.data![index]),
            );
      },
      child: Container(
        padding: EdgeInsets.all(8), // Add padding for spacing
        child: Row(
          children: [
            // Left side: Business image
            Container(
              width: 100,
              height: 100,
              color: Theme.of(context).primaryColor,
              child: Image.asset(
                'assets/images/business_image_0.png',
                fit: BoxFit.cover,
              ),
            ),

            // Middle: Business name and address
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    snapshot.data![index].name,
                    style: const TextStyle(fontSize: 18),
                  ),
                  Text(
                    snapshot.data![index].address,
                    style: TextStyle(fontSize: 14, color: Colors.grey),
                  ),
                ],
              ),
            ),

            // Right side: Points text box
            Container(
              width: 80,
              height: 100,
              color: Theme.of(context).primaryColor,
              child: Center(
                child: Text(
                  "0 points",
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
