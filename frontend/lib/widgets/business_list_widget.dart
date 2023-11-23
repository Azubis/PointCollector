import 'package:PointCollector/models/business_model.dart';
import 'package:PointCollector/screens/detail_screen.dart';
import 'package:PointCollector/states/riverpod_states.dart';
import 'package:PointCollector/styles/global_theme.dart';
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
    return Container(
      child: Center(
        child: RefreshIndicator(
          color: Theme.of(context).primaryColor,
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
        // set the product list to the products of the selected business
        ref
            .read(productProvider.notifier)
            .fetchProducts(snapshot.data![index].id);
        // set the current screen to the detail screen
        ref
            .read(currentScreenProvider.notifier)
            .setCurrentScreen(DetailScreen(business: snapshot.data![index]));
      },
      child: Container(
        padding: EdgeInsets.all(10),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.all(Radius.circular(10)),
          color: globalTheme.primaryColorLight,
        ),
        child: Container(
          child: Row(
            children: [
              // Left side: Business image
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: globalTheme.primaryColor,
                  borderRadius: BorderRadius.all(Radius.circular(50)),
                  border: Border.all(
                    color: Colors.black,
                    width: 2,
                  ),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(48),
                  child: Image.asset(
                    'assets/images/business_image_0.png',
                    fit: BoxFit.cover,
                  ),
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
                      textAlign: TextAlign.center,
                    ),
                    Text(
                      snapshot.data![index].address,
                      style: TextStyle(fontSize: 14, color: Colors.grey),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),

              // Right side: Points text box
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: globalTheme.primaryColor,
                  borderRadius: BorderRadius.all(Radius.circular(50)),
                  border: Border.all(
                    color: Colors.black,
                    width: 2,
                  ),
                ),
                child: Center(
                    child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "500",
                      style: TextStyle(
                        fontSize: 25,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                    Text(
                      "points",
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.normal,
                        color: Colors.black,
                      ),
                    ),
                  ],
                )),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
