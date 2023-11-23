import 'package:PointCollector/repository/ProductRepository.dart';
import 'package:PointCollector/repository/UserRepository.dart';
import 'package:PointCollector/screens/home_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/business_model.dart';
import '../models/product_model.dart';
import '../models/user_model.dart';
import '../repository/BusinessRepository.dart';

class CurrentPageState extends StateNotifier<Widget> {
  // 1. initialize with current time
  CurrentPageState() : super(HomeScreen());

  void setCurrentPage(Widget currentPage) => state = currentPage;
}

final currentPageProvider =
    StateNotifierProvider<CurrentPageState, Widget>((ref) {
  return CurrentPageState();
});

class CurrentScaffoldIndexState extends StateNotifier<int> {
  // 1. initialize with current time
  CurrentScaffoldIndexState() : super(0);

  void setCurrentScaffoldIndex(int index) => state = index;
}

final currentScaffoldIndexProvider =
    StateNotifierProvider<CurrentScaffoldIndexState, int>((ref) {
  return CurrentScaffoldIndexState();
});

class UserState extends StateNotifier<UserModel> {
  UserState() : super(UserModel.getUser());

  void setUser(UserModel user) => state = user;
}

final userProvider = StateNotifierProvider<UserState, UserModel>((ref) {
  return UserState();
});

class BusinessState extends StateNotifier<Future<List<Business>>> {
  BusinessState() : super(BusinessRepository().fetchBusinesses());

  //function to reload the businesses
  void reloadBusinesses() {
    BusinessRepository().isLoaded = false;
    state = BusinessRepository().fetchBusinesses();
  }
}

final businessProvider =
    StateNotifierProvider<BusinessState, Future<List<Business>>>((ref) {
  return BusinessState();
});

class ProductState extends StateNotifier<Future<List<ProductModel>>> {
  ProductState() : super(ProductRepository().fetchProducts(0));

  //function to reload the businesses
  void fetchProducts(int id) {
    state = ProductRepository().fetchProducts(id);
  }
  void reloadProducts(int id) {
    ProductRepository().setLoadedFalse();
    state = ProductRepository().fetchProducts(id);
  }

}

final productProvider =
    StateNotifierProvider<ProductState, Future<List<ProductModel>>>((ref) {
  return ProductState();
});

class RedeemPointState extends StateNotifier<int> {
  RedeemPointState() : super(UserRepository().getPoints());

  void setPoints(int points) => state = points;
}

final redeemPointProvider =
    StateNotifierProvider<RedeemPointState, int>((ref) {
  return RedeemPointState();
});
