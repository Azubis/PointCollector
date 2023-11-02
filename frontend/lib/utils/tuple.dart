class Tuple<T1, T2> {
  final T1 a;
  final T2 b;

  Tuple(this.a, this.b);

  getAt(int index) {
    switch (index) {
      case 0:
        return a;
      case 1:
        return b;
      default:
        throw Exception('Index out of range');
    }
  }
}
