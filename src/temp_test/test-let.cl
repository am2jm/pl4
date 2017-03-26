class Silly {
		copy() : SELF_TYPE {self};
};





class Sally inherits Silly {};



class Main inherits IO {
	var : Object <- 345;
	x : Object <-      (let q : String <- (new Sally).copy(), w: String <- "hello", o: String <- "7" in
	 {
	 	w;
		o;
	 }
      );
	p : Int <- 2 + 2;
	z : Sally <- (new Sally).copy();
	y : Object <- 999;
	a : String <- "divya";
	main() : Object { 777 };
};
