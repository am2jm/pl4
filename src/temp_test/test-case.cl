class Main inherits IO {
	var : Main <- new SELF_TYPE;

	x :

	SELF_TYPE <-
      case self of
	 a : Object => 123;
	 b : Int => 345;
	 c : String => 456;
      esac;
	y : SELF_TYPE <- self;
	a : String <- "divya";
	main() : Object { 777 };
};
