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

  factory UserModel.getUser(){
    return UserModel(
      name: "Leon Riesenwade",
      creationDate: DateTime.now(),
      email: "Leon@Wadenbeißer.com",
      city: "Kasselfornia",
      address: "Unterschenkel Straße. 47",
    );
  }
}
