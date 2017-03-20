class Main inherits IO {
	var : Object <- 345;
	x : Object <-
      case var of
	 a : Object => 123;
	 b : Int => 345;
	 c : String => 456;
      esac;   
	y : Object <- 999;
	a : String <- "divya";
	main() : Object { 777 };
};
