
class Main inherits IO {
    x : Int <- 5;
    y : Int <- value();
   main() : Object {
      {
          y <- x + y;
          x <- x + y;
      }

};
    value() : Int {
        666
    };
};
