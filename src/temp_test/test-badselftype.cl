class A {
     
   var : Object <- 0;

   value(x : Object) : Object { x };

   };
class B inherits A {

   avar : Object <- 0;

   value(x : Object) : Object { x };

   };
class Main inherits IO {
	var : Object <- 345;
	y : SELF_TYPE <- 999;
	a : String <- "divya";
	main() : Object { 777 };
	value(z: Object) : Object { z };
};
