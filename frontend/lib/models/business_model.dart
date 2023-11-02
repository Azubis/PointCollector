class Business {
  final String id;
  final String name;
  final String address;
  final String zipCode;

  Business(this.id, this.name, this.address, this.zipCode);

  factory Business.fromJson(Map<String, dynamic> json) {
    return Business(
      json['id'],
      json['name'],
      json['address'],
      json['zipCode'],
    );
  }

  static List<Business> fromJsonList(List<dynamic> jsonList) {
    return jsonList.map((json) => Business.fromJson(json)).toList();
  }
}
