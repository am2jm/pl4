class Main inherits IO {
	var : Object <- 345;
	x : Object <-
      case var of
	 a : Bool => new D;
	 b : Int => new H;
	 c : String => new F;
      esac;
	y : Object <- 999;
	a : String <- "divya";
	main() : Object { 777 };
};

class A inherits B{

};

class B inherits C{

};

class C inherits D{

};

class D inherits E{};

class E inherits H{};

class H{};

class F inherits C{};

class G inherits F{};
