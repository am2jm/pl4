class Silly {
		copy() : SELF_TYPE {self};
};





class Sally inherits Silly {};



class Main inherits IO {
	var : Object <- 345;
	x : Object <-      (let q : Int in
	 {
	 	5;
		6;
	 }
      );
	p : Int <- q + 2;
	z : Sally <- (new Sally).copy();
	y : Object <- 999;
	a : String <- "divya";
	main() : Object { 777 };
};
