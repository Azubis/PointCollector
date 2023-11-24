class Business {
  final int id;
  final String name;
  final String address;
  final String zipCode;

  Business({
    required this.id,
    required this.name,
    required this.address,
    required this.zipCode,
  });

  factory Business.fromJson(Map<String, dynamic> json) {
    return Business(
      id: json['id'],
      name: json['name'],
      address: json['address'],
      zipCode: json['zipCode'],
    );
  }

  static List<Business> fromJsonList(List<dynamic> jsonList) {
    return jsonList.map((json) => Business.fromJson(json)).toList();
  }
}
