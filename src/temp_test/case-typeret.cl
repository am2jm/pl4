class Main inherits IO {
	var : Object <- 345;
	x : Object <-
      case var of
	 a : Object => 123;
	 b : Int => 345;
	 c : String => 456;
      esac;
	z : Object <- 999;
	a : String <- "divya";
  y : Object <- while true loop 5 pool;
  h: Object <- if true then 5 else "hello" fi;

};
