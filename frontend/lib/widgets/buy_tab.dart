import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/business_model.dart';
import '../models/product_model.dart';
import '../states/riverpod_states.dart';

class BuyTab extends ConsumerWidget {
  final AsyncSnapshot<Business> business;
  BuyTab({required this.business});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Future<List<Product>> products = ref.watch(productProvider);
    return FutureBuilder<List<Product>>(
        future: products,
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            return Center(
              child: RefreshIndicator(
                //refresh on pull down calls setState and rebuilds the UI with
                // the new data
                onRefresh: () async {
                  ref
                      .read(productProvider.notifier)
                      .reloadProducts(business.data!.id);
                },
                child: ListView.separated(
                  padding: const EdgeInsets.all(8),
                  itemCount: snapshot.data!.length,
                  itemBuilder: (BuildContext context, int index) {
                    return Row(
                      children: [
                        Image.asset(
                          snapshot.data![index].image,
                          width: 100,
                          height: 100,
                        ),
                        SizedBox(width: 18),
                        Expanded(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    snapshot.data![index].name,
                                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                                  ),
                                  SizedBox(height: 8), // Add some vertical spacing between name and numbers
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    children: [
                                      Container(
                                        child: Text(
                                          snapshot.data![index].price
                                              .toString() + "€",
                                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                      SizedBox(width: 15), // Adjust as needed
                                      Row(
                                        children: [
                                          Text(
                                            snapshot.data![index].pointsGain
                                                .toString(),
                                            style: const TextStyle(
                                                fontSize: 18,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.blue),
                                          ),
                                          Icon(
                                            Icons.auto_awesome_rounded,
                                            size: 20,
                                            color: Colors.blue,
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
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
        });
  }
}
