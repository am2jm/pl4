class A {
	value(x : A) : SELF_TYPE { self};
};

class B inherits A {


};

class C inherits B{


};

class D inherits C{
	x : Object <- (new C)@B.value(new SELF_TYPE);

};

class Main inherits IO {
	var : Object <- 345;

	y : Object <- 999;
	a : String <- "divya";
	main() : SELF_TYPE { self };
};
