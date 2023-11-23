import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/business_model.dart';
import '../../models/product_model.dart';
import '../../states/riverpod_states.dart';

class RedeemTab extends ConsumerWidget {
  final Business business;
  RedeemTab({required this.business});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Future<List<ProductModel>> products = ref.watch(productProvider);
    int redeemPoints = ref.watch(redeemPointProvider);
    return FutureBuilder<List<ProductModel>>(
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
                      .reloadProducts(business.id);
                },
                child: ListView.separated(
                  padding: const EdgeInsets.all(8),
                  itemCount: snapshot.data!.length,
                  itemBuilder: (BuildContext context, int index) {
                    // Check if the item is redeemable
                    if (snapshot.data![index].isRedeemable) {
                      return Row(
                        children: [
                          Image.asset(snapshot.data![index].image,
                              width: 100, height: 100),
                          SizedBox.fromSize(size: Size(20, 0)),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start, //
                            // Align text to the start
                            children:[
                          Text(snapshot.data![index].name,
                              style: const TextStyle(fontSize: 18,
                                  fontWeight: FontWeight.bold)),
                          SizedBox.fromSize(size: Size(20, 0)),
                          Row(
                            children: [
                              Text(snapshot.data![index].redeemCost.toString(),
                                style: const TextStyle(fontSize: 18,
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
                      Expanded(
                        child: Container(),
                      ),
                          ElevatedButton(
                            onPressed: redeemPoints >= snapshot.data![index].redeemCost
                                ? () {
                              ref.read(redeemPointProvider.notifier)
                                  .setPoints(redeemPoints - snapshot.data![index].redeemCost);
                            }
                                : null, // Set onPressed to null to disable the button
                            style: ButtonStyle(
                              backgroundColor: MaterialStateProperty.resolveWith<Color>((states) {
                                if (states.contains(MaterialState.disabled)) {
                                  // Button is disabled, return grey color
                                  return Colors.grey;
                                }
                                // Button is enabled, return the default color
                                return Colors.blue;
                              }),
                            ),
                            child: const Text(
                              'Redeem',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          )
                      ],
                      );
                    }
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
