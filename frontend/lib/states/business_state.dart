import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/business_model.dart';
import '../repository/business_repository.dart';

class BusinessState extends StateNotifier<Future<List<Business>>> {
  BusinessState() : super(BusinessRepository().fetchBusinesses());

  void reloadBusinesses() {
    BusinessRepository().isLoaded = false;
    state = BusinessRepository().fetchBusinesses();
  }
}

final businessProvider =
    StateNotifierProvider<BusinessState, Future<List<Business>>>((ref) {
  return BusinessState();
});
