import 'package:PointCollector/models/user_model.dart';
import 'package:PointCollector/styles/global_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../states/user_state.dart';

class UserListWidget extends StatelessWidget {
  final WidgetRef ref;
  final AsyncSnapshot<List<User>> snapshot;

  UserListWidget({
    required this.ref,
    required this.snapshot,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Theme.of(context).primaryColorLight,
      child: Center(
        child: RefreshIndicator(
          color: Theme.of(context).primaryColor,
          onRefresh: () async {
            ref.read(userProvider.notifier).reloadUsers();
          },
          child: ListView.separated(
            padding: const EdgeInsets.all(8),
            itemCount: snapshot.data!.length,
            itemBuilder: (BuildContext context, int index) {
              return UserListWidgetItem(
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

class UserListWidgetItem extends StatelessWidget {
  final WidgetRef ref;
  final AsyncSnapshot<List<User>> snapshot;
  final int index;

  UserListWidgetItem({
    required this.ref,
    required this.snapshot,
    required this.index,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {},
      child: Container(
        padding: EdgeInsets.all(10),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.all(Radius.circular(10)),
          color: globalTheme.primaryColorLight,
        ),
        child: Container(
          child: Row(
            children: [
              // Middle: user name
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
