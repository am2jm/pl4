
class Main inherits IO {
    x : Int <- 5;
    y : Int <- 999;
   main() : Object {
      {
          y <- x + y;
          x <- x + y;
      }

};
};
