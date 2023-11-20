class Business {
  final int id;
  final String name;
  final String address;
  final String zipCode;
  final int points;

  Business({
    required this.id,
    required this.name,
    required this.address,
    required this.zipCode,
    required this.points,
  });

  factory Business.fromJson(Map<String, dynamic> json) {
    return Business(
      id: json['id'],
      name: json['name'],
      address: json['address'],
      zipCode: json['zipCode'],
      points: json['points'],
    );
  }
  static List<Business> fromJsonList(List<dynamic> jsonList) {
    return jsonList.map((json) => Business.fromJson(json)).toList();
  }
}
