class Business {
  final int id;
  final String name;
  final String address;
  final String zipCode;
  final String image;
  final String logo;
  final int points;

  Business({
    required this.id,
    required this.name,
    required this.address,
    required this.zipCode,
    required this.image,
    required this.logo,
    required this.points,
  });

  factory Business.fromJson(Map<String, dynamic> json) {
    return Business(
      id: json['id'],
      name: json['name'],
      address: json['address'],
      zipCode: json['zipCode'],
      image: json['image'],
      logo: json['logo'],
      points: json['points'],
    );
  }

  static List<Business> fromJsonList(List<dynamic> jsonList) {
    return jsonList.map((json) => Business.fromJson(json)).toList();
  }
}
