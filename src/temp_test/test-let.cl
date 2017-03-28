class Silly inherits Main
{
		copy() : SELF_TYPE {self};
		q: SELF_TYPE <- (new Main).main();
};

class Sally inherits Main {
p : Main <- new SELF_TYPE;
f : Int <- main()+ main();


};

class Main inherits IO {
	var : Object <- 345;

	z : Sally <- (new Sally).copy();
	y : Object <- 999;
	a : String <- "divya";
	main() : SELF_TYPE { 777 };
};
