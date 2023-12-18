import 'dart:convert';

import 'package:PointCollector/models/business_model.dart';
import 'package:PointCollector/models/product_model.dart';
import 'package:http/http.dart' as http;

// This Repository is a Singleton. It fetches business data from the backend
// ONCE. Has a factory constructor which always returns the same Instance of
// this class. Meaning you always work with the same data
// and only receive new businesses on a manual reload
class ProductRepository {
  late Future<List<Product>> _products;
  int _businessLoaded = 0;

  // the _singleton variable is initialized with an instance of the class
  static final ProductRepository _singleton = ProductRepository._internal();

  // The factory constructor always returns the same instance of the class
  factory ProductRepository() {
    return _singleton;
  }

  // The internal constructor is only called once
  ProductRepository._internal();

  Future<List<Product>> fetchProducts(int id) async {
    if (_businessLoaded == id) {
      // If data is already fetched, return the cached result
      return _products;
    }

    try {
      final response = await http.get(
          Uri.parse('https://pointcollector.onrender.com/api/products/' + id.toString()));

      if (response.statusCode == 200) {
        List<dynamic> jsonData = json.decode(response.body);

        _products = Future.value(Product.fromJsonList(jsonData));
        _businessLoaded = id;
        return _products;
      } else {
        throw Exception('Failed to load products');
      }
    } catch (e) {
      throw Exception('Failed to load products: $e');
    }
  }

  void setLoadedFalse() {
    _businessLoaded = 0;
  }

  Future<List<Product>> get products => _products;
}
