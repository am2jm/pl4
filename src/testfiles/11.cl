

class Foo inherits Bazz {
a : Razz <- case self of
n : Razz => ( new Bar ) ;
esac ;

b : Int <- a . doh ( ) + g . doh ( ) + doh ( ) + printh ( ) ;

doh ( ) : Int { ( let i : Int <- h in { h <- h + 2 ; i ; } ) } ;

} ;

class Bar inherits Razz {

c : Int <- doh ( ) ;

d : Object <- printh ( ) ;
} ;


class Razz inherits Foo {

e : Bar <- case self of
n : Razz => ( new Bar ) ;
esac ;

f : Int <- a @ Bazz . doh ( ) + g . doh ( ) + e . doh ( ) + doh ( ) + printh ( ) ;

} ;

class Bazz inherits IO {

h : Int <- 1 ;
doh ( ) : Int { ( let i : Int <- h in { h <- h + 1 ; i ; } ) } ;
} ;


class Main inherits IO {
a : Bazz <- new Bazz ;
b : Foo <- new Foo ;
c : Razz <- new Razz ;
d : Bar <- new Bar ;

main ( ) : String { { out_string ( "\n" ) ; "do nothing" ; } } ;

} ;
