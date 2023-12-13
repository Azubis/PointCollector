class Business {
  final int id;
  final String name;
  final String address;
  final String zipCode;
  final String image;
  final String logo;
  int points;

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

  Business copyWith({int? points}) {
    return Business(
      id: this.id,
      name: this.name,
      address: this.address,
      zipCode: this.zipCode,
      image: this.image,
      logo: this.logo,
      points: points ?? this.points,
    );
  }
}
