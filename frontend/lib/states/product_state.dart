import 'package:PointCollector/repository/product_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/product_model.dart';

class ProductState extends StateNotifier<Future<List<ProductModel>>> {
  ProductState() : super(ProductRepository().fetchProducts(0));

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
