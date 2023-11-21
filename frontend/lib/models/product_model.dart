class ProductModel {
  final String image;
  final String name;
  final double price;
  final int pointsGain;
  final int redeemCost;
  final bool isRedeemable;

  ProductModel({
    required this.image,
    required this.name,
    required this.price,
    required this.pointsGain,
    required this.redeemCost,
    required this.isRedeemable,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      image: json['image'],
      name: json['name'],
      price: json['price'],
      pointsGain: json['pointsGain'],
      redeemCost: json['redeemCost'],
      isRedeemable: json['isRedeemable'],
    );
  }

  static List<ProductModel> fromJsonList(List<dynamic> jsonList) {
    return jsonList.map((json) => ProductModel.fromJson(json)).toList();
  }
}
