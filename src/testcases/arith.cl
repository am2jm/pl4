
class Main inherits IO {
    x : Int <- 5;
    y : Int <- value(2,3);
   main() : Object {
      {
          y <- x + y;
          x <- x + y;
      }

};
    value(a: Int, b: Int) : Int {
        666
    };
};
