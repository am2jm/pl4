class Main inherits IO {
	var : SELF_TYPE <- 345;
	x : Object <-
      case var of
	 a : Object => 123;
	 b : Int => 345;
	 c : String => 456;
      esac;
	y : Object <- 999;
	a : String <- "divya";
	a : Object <- x;
	main() : Object { 777 };
};
