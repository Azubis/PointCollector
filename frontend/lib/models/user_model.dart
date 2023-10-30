class UserModel {
  String name;
  DateTime creationDate;
  String email;
  String city;
  String address;

  UserModel({
    required this.name,
    required this.creationDate,
    required this.email,
    required this.city,
    required this.address,
  });

  factory UserModel.getUser() {
    return UserModel(
      name: "Max Mustermann",
      creationDate: DateTime.now(),
      email: "max@mustermann.com",
      city: "Kasselfornia",
      address: "Straße. 47",
    );
  }
}
