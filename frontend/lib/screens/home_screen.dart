import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:PointCollector/models/business_model.dart';
import 'package:PointCollector/repository/BusinessRepository.dart';

import 'detail_screen.dart';

class HomeScreen extends StatefulWidget {
  @override
  State<StatefulWidget> createState() {
    return _HomeScreenState();
  }

}

class _HomeScreenState extends State<HomeScreen> {

  final BusinessRepository businessRepository = BusinessRepository();
  late Future<List<Business>> business;

  //This method gets called when setState is called
  //It is used to fetch new data from the backend and update the UI
  @override
  void initState() {
    super.initState();
    business = businessRepository.fetchBusinesses();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Business>>(
      future: business,
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return RefreshIndicator(
            //refresh on pull down calls setState and rebuilds the UI with
            // the new data
            onRefresh: () async {
              businessRepository.isLoaded = false;
              setState(() {
                business = businessRepository.fetchBusinesses();
              });
            },
            //ListView.separated is used to display a list of the fetched data
            child: ListView.separated(
              padding: const EdgeInsets.all(8),
              itemCount: snapshot.data!.length,
              itemBuilder: (BuildContext context, int index) {
                return InkWell(
                  onTap: () {
                    Navigator.pushNamed(context, '/detailScreen', arguments: snapshot.data![index]);
                  },
                  child: Container(
                  height: 100,
                  color: Colors.blue[100],
                  child: Center(child: Text(snapshot.data![index].name, style: const TextStyle(fontSize: 18))),
                  ),
                );
            },
            separatorBuilder: (BuildContext context, int index) => const Divider(),
            ),
          );
        }
        else if (snapshot.hasError) {
          return Text('${snapshot.error}');
        }
        return const CircularProgressIndicator();
      },
    );
  }
}