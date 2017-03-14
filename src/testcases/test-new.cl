class A2I {
        a : Int <- 5;
        b : Object <- 999;
        hello() : Object { 777 };
};

class B2I {
        a : Int <- 5;
        b : Object <- 999;
        method5(num : Object) : Object { 777 };
};

class Main inherits IO {
	x : Int <- 5;
	y : Object <- new A2I;
	z : A2I <- (new A2I)@B2I.method5(A2I.hello());
	main() : Object { 777 };
};
