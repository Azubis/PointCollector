class Product {
  final String image;
  final String name;
  final double price;
  final int pointsGain;
  final int redeemCost;
  final bool isRedeemable;

  Product({
    required this.image,
    required this.name,
    required this.price,
    required this.pointsGain,
    required this.redeemCost,
    required this.isRedeemable,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      image: json['image'],
      name: json['name'],
      price: json['price'].toDouble(),
      pointsGain: json['pointsGain'],
      redeemCost: json['redeemCost'],
      isRedeemable: json['isRedeemable'],
    );
  }

  static List<Product> fromJsonList(List<dynamic> jsonList) {
    return jsonList.map((json) => Product.fromJson(json)).toList();
  }
}
