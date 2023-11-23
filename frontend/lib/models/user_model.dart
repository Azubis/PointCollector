class User {
  int id;
  String name;
  DateTime creationDate;
  String email;
  String city;
  String address;

  User({
    required this.id,
    required this.name,
    required this.creationDate,
    required this.email,
    required this.city,
    required this.address,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      creationDate: DateTime.parse(json['creationDate']),
      email: json['email'],
      city: json['city'],
      address: json['address'],
    );
  }

  static List<User> fromJsonList(List<dynamic> jsonList) {
    return jsonList.map((json) => User.fromJson(json)).toList();
  }
}
