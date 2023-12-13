import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../repository/UserRepository.dart';

class RedeemPointState extends StateNotifier<int> {
  RedeemPointState() : super(UserRepository().getPoints());

  void setPoints(int points) => state = points;
}

final redeemPointProvider =
StateNotifierProvider<RedeemPointState, int>((ref) {
  return RedeemPointState();
});
