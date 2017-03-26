class A {

   var : A <- 0;

   value(x : A) : Object { x };

   };    

class Main inherits IO {
	var : Object <- 345;
	x : Object <- (new A).value(new A);
	y : Object <- 999;
	a : String <- "divya";
	main() : Object { 777 };
	value( z: Object) : Object { z };
};
