class Silly inherits Main
{
		copy() : SELF_TYPE {self};
};

class Sally inherits Main {};

class Main inherits IO {
	var : Object <- 345;
	x : Object <-      (let q : Int <- 6, w: String <- "hello", o: String <- "7" in
	 {
	 	w;
		o;
	 }
      );
	p : Main <- new SELF_TYPE;
	z : Sally <- (new Sally).copy();
	y : Object <- 999;
	a : String <- "divya";
	main() : Object { 777 };
};
