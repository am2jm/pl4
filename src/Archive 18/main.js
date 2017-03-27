fs = require('fs');
topsort = require("./topsort.js");
symboltable = require("./symboltable.js");

//var myTable = new symTbl.SymbolTable();
//
//myTable.add("4", "5");
//myTable.add("5", "6");
//var ind = myTable.find("5");
//console.log(ind);
//var ind = myTable.mem("5");
//console.log(myTable, ind);
//-----------SECTION: define the built in functions----------------------------
// Base functions that belong to IO
var out_string = new Method(new Id(0, "out_string"), [new Formal(new Id(0, "x"), new Id(0, "String"))], new Id(0, "SELF_TYPE"), new Exp(0, new Id(0, "self")), "IO");
var out_int = new Method(new Id(0, "out_int"), [new Formal(new Id(0, "x"), new Id(0, "Int"))], new Id(0, "SELF_TYPE"), new Exp(0, new Id(0, "self")), "IO");
var in_string = new Method(new Id(0, "in_string"), [], new Id(0, "String"), new Exp(0, new String("hello")), "IO");
var in_int = new Method(new Id(0, "in_int"), [], new Id(0, "Int"), new Exp(0, new Integer(555)), "IO");

//Base functions that belong to Object
var methabort = new Method(new Id(0, "abort"), [], new Id(0, "Object"), new Exp(0, new Integer(555)), "Object");
var type_name = new Method(new Id(0, "type_name"), [], new Id(0, "String"), new Exp(0, new String("555")), "Object");
var copy = new Method(new Id(0, "copy"), [], new Id(0, "SELF_TYPE"), new Exp(0, new Id(0, "self")), "Object");

//Base functions that belong to String
var melen = new Method(new Id(0, "length"), [], new Id(0, "Int"), new Exp(0, new Integer(555)), "String");
var meconcat = new Method(new Id(0, "concat"), [new Formal(new Id(0, "s"), new Id(0, "String"))], new Id(0, "String"), new Exp(0, new String("hello")), "String");
var mesubs = new Method(new Id(0, "substr"),[new Formal(new Id(0, "i"), new Id(0, "Int")), new Formal(new Id(0, "l"), new Id(0, "Int"))], new Id(0, "String"), new Exp(0, new String("hello")), "String");





//------------SECTION 1: define types--------------------------------------

function CoolClass(cname, inhert, features){
	this.cname = cname;
	this.inherit = inhert;
	this.features = features;
	this.attrib = [];
	this.method = [];
}

function Method(mname, formals, mtype, mbody, mdef){
	// if(typeof mdef === "undefined"){
	// 	this.definition = "";
	// }
	// else{
	this.definition = mdef;
	// }
	// this.definition = "Hello Div";
	this.mname = mname;
	this.formals = formals;
	this.mtype = mtype;
	this.mbody = mbody;
	this.fmeth = "Method";
	this.rettype = "";
}
function Attribute(fname, ftype, initals){
	this.fname = fname;
	this.ftype = ftype;
	this.finit = initals;
	this.fmeth = "Attribute";
	this.rettype = "";
}
function Formal(fname, ftype){
	this.fname = fname;
	this.ftype = ftype;

}
function Exp(eloc, ekind){
	this.eloc = eloc;
	this.ekind = ekind;
//	this.rettype = "";
}
function Id(loc, name){
	this.etype = "identifier";
	this.loc = loc;
	this.name = name;
	this.rettype = "";
}
function Integer(ival){
	this.etype = "integer";
	this.value = ival;
	this.rettype = "Int";
}
function Bool(ival){
	this.etype = "bool";
	this.value = ival;
	this.rettype = "Bool";
}
function String(ival){
	this.etype = "string";
	this.value = ival;
	this.rettype = "String";
}
function Not(ival){
	this.etype = "not";
	this.value = ival;
	this.rettype = "";
}
function Comp(mtype, item1, item2){
	this.etype = mtype;
	this.val1 = item1;
	this.val2 = item2;
	this.rettype = "";
}
function Negate(item){
	this.etype = "negate";
	this.value = item;
	this.rettype = "";
}
function IsVoid(etype, line){
	this.etype = etype;
	this.value = line;
	this.rettype = "";
}
function NewType(etype, item){
	this.etype = etype;
	this.value = item;
	this.rettype = "";
}
function Block(etype, evalue){
	this.etype = etype;
	this.value = evalue;
	this.rettype = "";
}
function Assign(etype, eid, exp){
	this.etype = etype;
	this.eid = eid;
	this.exp = exp;
	this.rettype = "";
}
function SDispatch(etype, eid, argsa){
	this.etype = etype;
	this.eid = eid;
	this.args = argsa;
	this.rettype = "";
}
function DDispatch(ekind, eexp, etype, eid, args){
	this.etype = ekind;
	this.exp = eexp;
	this.dtype = etype;
	this.did = eid;
	this.arglist = args;
	this.rettype = "";
}
function If(etype, econd, itrue, ifalse){
	this.etype = etype;
	this.cond = econd;
	this.itrue = itrue;
	this.ifalse = ifalse;
	this.rettype = "";
}
function While(etype, econd, ival){
	this.etype = etype;
	this.cond = econd;
	this.value = ival;
	this.rettype = "";
}
function Action(myid, mytype, myexp){
	this.id = myid;
	this.atype = mytype;
	this.exp = myexp;
	this.rettype = "";
}
function Case(myexp, actlist){
	this.etype = "case";
	this.exp = myexp;
	this.action = actlist;
	this.rettype = "";
}
function Let(letlist, inexp){
	this.etype = "let";
	this.letlist = letlist;
	this.inexp = inexp;
	this.rettype = "";
}
//------------SECTION 2: Read File and build AST-------------------------------

function readFile(){
	var contents = fs.readFileSync(process.argv[2]).toString();
	contents = contents.split("\n");
	//  contents = contents.split("\r\n");
	contents.pop();
	return contents;
}

//load ast
var myAST = readFile();
var myindex = 0;
var userClasses = [];
var identifiers = [];
var fname = process.argv[2].slice(0, -4);
fname += "-type";


if(myAST.indexOf("main")==-1){
	console.log("ERROR: 0: Type-Check: no main method in entire AST");
	process.exit();
}


//helper function to consume input from the ast
function read(ast){
	var item = myAST[myindex];
	myindex++;
	return item;
}

//------------SECTION 3: Traverse AST and Type Check-------------------------------

//read a list with a function
function read_list(worker, clname){
	var llength = read();
	var items = [];
	for(var i = 0; i < llength; i++){
		items.push(worker(clname));
	}
	return items;
}

function readCoolProgram(){
	read_list(read_cool_class);
}

//returns a cool class
function read_cool_class(){
	var cname = read_id();
	var inherit = "";
	var citem = read();
	if(citem == "inherits"){
		inherit = read_id();
	}
	else if(citem == "no_inherits"){
	}
	else{
		console.log("nope!", citem);
//		console.log("."+citem+".");
	}

	var features = read_list(read_features, cname.name);
	userClasses.push(new CoolClass(cname, inherit, features));
	return new CoolClass(cname, inherit, features);
}

//reads features
function read_features(clname){
	var citem = read();

	if(citem == "attribute_no_init"){
		var fname = read_id();
		var ftype = read_id();

		return new Attribute(fname, ftype, []);
	}
	else if(citem == "attribute_init"){
		var fname = read_id();
		var ftype = read_id();
		var finit = read_exp();

		return new Attribute(fname, ftype, finit);
	}
	else if(citem == "method"){ // method
		var mname = read_id();
		var formals = read_list(read_formal);
		var mtype = read_id();
		var mbody = read_exp();

		// console.log(mbody);
		// console.log("^ function");
		// console.log("clname",clname);
		return new Method(mname, formals, mtype, mbody, clname);
	}
}

//returns a Formal
function read_formal(){
	var fname = read_id();
	var ftype = read_id();

	if(fname.name == "self" || ftype.name == "self"){
		console.log("ERROR: " + fname.loc + ": Type-Check: cannot use self as a parameter!!");
		process.exit();
	}
	if(fname.name == "SELF_TYPE" || ftype.name == "SELF_TYPE"){
		console.log("ERROR: " + fname.loc + ": Type-Check: cannot use SELF_TYPE as a parameter!!");
		process.exit();
	}
	return new Formal(fname, ftype);
}

//returns an ID
function read_id(){
	var loc = read();
	var name = read();
	return new Id(loc, name);
}

//reads every type of expression and returns it
function read_exp(){

	//location, expression information, expression type
	var eloc = read();
	var ekind = "";

	var citem = read();

//sets expression information
	if(citem == "integer"){
		var ival = read();
		ekind = new Integer(ival);
	}
	else if(citem == "not"){
		ekind = new Not(read_exp());
	}
	else if(check(citem, ["true", "false"])){
		ekind = new Bool(citem);
	}
	else if(citem == "string"){
		var ival = read();
		ekind = new String(ival);
	}
	else if(citem == "identifier"){
		ekind = read_id();
	}
	else if(check(citem, ["lt", "eq", "le", "plus", "minus", "times", "divide"])){
		var item1 = read_exp();
		var item2 = read_exp();
		// console.log(eloc, item1);
		ekind = new Comp(citem, item1, item2);
		// console.log(eloc,ekind);
	}
	else if(citem == "negate"){
		ekind = new Negate(read_exp());
	}
	else if(citem == "isvoid"){
		var item = read_exp();
		ekind = new IsVoid(citem, item);
	}
	else if(citem == "new"){
		ekind = new NewType(citem, read_id());
	}
	else if(citem == "block"){
		var blist = [];
		var len = read();
		for( var i = 0; i < len; i++){
			blist.push(read_exp());
		}
		ekind = new Block("block", blist);
	}
	else if(citem == "assign"){
		ekind = new Assign("assign", read_id(), read_exp());
	}
	else if(citem == "self_dispatch"){
		var sdlist = [];
		var myid = read_id();
		var len = read();
		// console.log(myid.loc, len);
		for( var i = 0; i < len; i++){
			var item = read_exp();
			// console.log(eloc, item);
			sdlist.push(item);
		}
		// console.log(myid.loc, sdlist);

		ekind = new SDispatch("self_dispatch", myid, sdlist);
		// console.log(eloc, ekind);
	}
	else if(citem == "if"){
		ekind = new If("if", read_exp(), read_exp(), read_exp());
	}
	else if(citem == "while"){
		ekind = new While("while", read_exp(), read_exp());
	}
	else if(citem == "case"){
		actlist = [];
		var cexp = read_exp();
		var len = read();

		//read case list
		for(var i = 0; i < len; i++){
			var myid = read_id();
			var mytype = read_id();
			var myexp = read_exp();
			if(myid.name == "self"){
				console.log("ERROR: " + myid.loc + ": Type-Check: cannot use self as a thing in !!");
				process.exit();
			}

			actlist.push(new Action(myid, mytype, myexp));
		}

		ekind = new Case(cexp, actlist);
	}
	else if(citem == "let"){
		var letlist = [];
		var len = read();
		var myid;
		var mytype;
		var myexp;

		//read let binding list
		for(var i = 0; i < len; i++){
			var lettype = read();
			myid = read_id();
			mytype = read_id();
			if(lettype == "let_binding_init"){
				myexp = read_exp();
			}
			else if(lettype == "let_binding_no_init"){
				myexp = "";
			}
			else{
				console.log("This let not possible");
			}
			if(myid.name == "self"){
				console.log("ERROR: " + myid.loc + ": Type-Check: cannot use self as a thing in !!");
				process.exit();
			}

			letlist.push(new Action(myid, mytype, myexp));
		}
		var inexp = read_exp();
		ekind = new Let(letlist, inexp);
	}
	//check for dynamic/static dispatch
	else if(check(citem, ["dynamic_dispatch", "static_dispatch"])){
		var mexp = read_exp();
		var mtype = "";
		if(citem == "static_dispatch"){
			mtype = read_id();
		}
		var mid = read_id();
		var len = read();
		var arglist = [];
		for(var i = 0; i < len; i++){
			arglist.push(read_exp());
		}
		ekind = new DDispatch(citem, mexp, mtype, mid, arglist);
	}
	else{
		console.log("Have not done:" + citem + " " + process.argv[2]);
	}
	return new Exp(eloc, ekind);
}

//read cool program recursively
readCoolProgram();


var base_classes = ["Int", "String", "Bool", "IO", "Object"];
var user_classes = [];

//throw error if base classes are redefined
for (var q = 0; q < userClasses.length; q++) {
	user_classes.push(userClasses[q].cname.name);
	if(base_classes.indexOf(user_classes[q]) != -1 || user_classes.indexOf("SELF_TYPE") != -1){
		console.log("ERROR: "+ userClasses[q].cname.loc +": Type-Check: base class redefined");
		process.exit();
	}
}

//combine all classes
var all_classes = base_classes.concat(user_classes);
// Check to make sure there is a main class!
if(user_classes.indexOf("Main") == -1){
	console.log("ERROR: 0: Type-Check: no Main class BOI");
//	process.exit();
}

//checks if a user class is redefined
for(var x = 0; x < user_classes.length; x++){
	for(var y = 0; y < user_classes.length; y++){
		if(x != y){
			if(user_classes[x] == user_classes[y]){
				var index = user_classes.lastIndexOf(user_classes[x]);
				console.log("ERROR: "+ userClasses[index].cname.loc + ": Type-Check: class got redefined!");
				process.exit();
			}
		}
	}
}

//check if all inherits are valid
for(var q = 0; q < userClasses.length; q++){

//checks all classes that inherits something
	if(userClasses[q].inherit != ""){

		var myinherit = userClasses[q].inherit.name;

		//check from base classes
		if( check(myinherit, ["Int", "String", "Bool"]) ){
			console.log("ERROR: " + userClasses[q].inherit.loc + ": Type-Check: cannot inherit from Integer!");
			process.exit();
		}

		//check the undefined classes
		else if( !check(myinherit, all_classes) ){
			console.log("ERROR: " + userClasses[q].inherit.loc + ": Type-Check: inherits from undefined class BOI " + myinherit);
			process.exit();
		}
		//check if a class inherits from itself
		else if( myinherit == userClasses[q].cname.name){
			console.log("ERROR: 0: Type-Check: I inherit from myself! " + myinherit);
			process.exit();
		}
	}
}


//-------------SECTION 4: Generate Classmap

// A function that will output each expression that can be found
function output_exp(expression, typeflag){

	var exptype = expression.ekind.etype;
	write("" + expression.eloc + "\n");
	if(typeflag){
		write(expression.ekind.rettype + "\n");
	}
	//check every type of expression
	if(check(exptype, ["integer", "string"])){
		write(exptype + "\n" + expression.ekind.value  + "\n");
	}
	else if (exptype == "not"){
		write("not"  + "\n")
		output_exp(expression.ekind.value, typeflag);
	}
	else if (exptype == "bool"){
		write(expression.ekind.value  + "\n");
	}
	else if(exptype == "identifier"){
		write("identifier\n" + expression.ekind.loc + "\n");
		write(expression.ekind.name + "\n");
	}
	else if(check(exptype, ["lt", "eq", "le", "plus", "minus", "times", "divide"])){
		write(exptype + "\n");
		output_exp(expression.ekind.val1, typeflag);
		output_exp(expression.ekind.val2, typeflag);
	}
	else if(check(exptype, ["negate", "isvoid"])){
		write(exptype + "\n");
		output_exp(expression.ekind.value, typeflag);
	}
	else if(exptype == "new"){
		write(exptype + "\n");
		write(expression.ekind.value.loc + "\n" + expression.ekind.value.name+ "\n");
	}
	else if(exptype == "self_dispatch"){
		// console.log(expression.ekind, " I think");
		write(exptype + "\n");
		write(expression.ekind.eid.loc + "\n" + expression.ekind.eid.name + "\n" + expression.ekind.args.length + "\n");

		for(var q = 0; q < expression.ekind.args.length; q++){
			output_exp(expression.ekind.args[q], typeflag);
		}
	}
	else if(exptype == "if"){
		write(exptype + "\n");
		output_exp(expression.ekind.cond, typeflag);
		output_exp(expression.ekind.itrue, typeflag);
		output_exp(expression.ekind.ifalse, typeflag);
	}
	else if(exptype == "while"){
		write(exptype + "\n");
		output_exp(expression.ekind.cond, typeflag);
		output_exp(expression.ekind.value, typeflag);
	}
	else if(exptype == "assign"){
		write(exptype + "\n");
		write(expression.ekind.eid.loc + "\n" + expression.ekind.eid.name + "\n");
		output_exp(expression.ekind.exp, typeflag);

	}
	else if(exptype == "block"){
		write(exptype + "\n");
		write(expression.ekind.value.length + "\n");
		for(var q = 0; q < expression.ekind.value.length; q++){
			output_exp(expression.ekind.value[q], typeflag);
		}
	}
	else if(exptype == "case"){
		write(exptype + "\n");
		output_exp(expression.ekind.exp, typeflag);

		var len = expression.ekind.action.length;
		var mylist = expression.ekind.action;
		write(len + "\n");
		for(var q = 0; q < len; q++){
			write(mylist[q].id.loc + "\n" + mylist[q].id.name + "\n");
			write(mylist[q].atype.loc + "\n" + mylist[q].atype.name + "\n");
			output_exp(mylist[q].exp, typeflag);
		}
	}
	else if(exptype == "let"){
		write(exptype + "\n");

		var mylist = expression.ekind.letlist;
		var len = mylist.length;
		write(len + "\n");

		for(var q = 0; q < len; q++){
			if(mylist[q].exp == ""){
				write("let_binding_no_init\n");
				write(mylist[q].id.loc + "\n" + mylist[q].id.name + "\n");
				write(mylist[q].atype.loc + "\n" + mylist[q].atype.name + "\n");
			}
			else{
				write("let_binding_init\n");
				write(mylist[q].id.loc + "\n" + mylist[q].id.name + "\n");
				write(mylist[q].atype.loc + "\n" + mylist[q].atype.name + "\n");
				output_exp(mylist[q].exp, typeflag);
			}

		}


		output_exp(expression.ekind.inexp, typeflag);
	}
	else if(check(exptype, ["static_dispatch", "dynamic_dispatch"])){
		// console.log(expression.ekind.dtype.name, " I think");
		write(exptype + "\n");
		output_exp(expression.ekind.exp, typeflag);

		if(exptype == "static_dispatch"){
			write(expression.ekind.dtype.loc + "\n" + expression.ekind.dtype.name + "\n");
		}
		write(expression.ekind.did.loc + "\n" + expression.ekind.did.name + "\n");

		var mylist = expression.ekind.arglist;
		var len = mylist.length;
		write(len + "\n");
		for(var q = 0; q < len; q++){
			output_exp(mylist[q], typeflag);
		}
	}
}

// --------------------SECTION 5: Sort Classes Topologically

var graph = [];
var loners = [];

//build graph
for(var i = 0; i < user_classes.length; i++){
	var indof = user_classes.indexOf(user_classes[i]);

	if(userClasses[indof].inherit != ""){
		var parent = userClasses[indof].inherit.name;
		var child = userClasses[indof].cname.name;

		if(parent == "SELF_TYPE" || child == "SELF_TYPE"){
			console.log("ERROR: "+ userClasses[indof].inherit.loc + ": Type-Check: inheritance cycle there be");
			process.exit();
		}
		graph.push([parent, child]);
	}
	else{

		//add nodes without dependencies straight to the graph
		var item = userClasses[indof].cname.name;
		loners.push(item);
	}
}

//topologically sort the graph

// var edges = graph;
//catch errors
if(graph.length>0){
	graph = topsort.sortTopo(graph);
	if(graph== "cycle"){
		console.log("ERROR: 0: Type-Check: inheritance cycle there be");
		process.exit();
	}
}

//combine independent nodes and sorted nodes
graph = graph.concat(loners);




//-------------SECTION 6: Inherit Methods and Attributes
for(var ind = 0; ind < graph.length; ind ++){

// if user class, add relevant methods and attributes
	if(check(graph[ind], user_classes)){
		var indof = user_classes.indexOf(graph[ind]);
		var attrib = [];
		var attribname = [];
		var method = [];
		var methodname = [];
		var len = userClasses[indof].features.length;

		for(var i = 0; i < len; i++){
			if (userClasses[indof].features[i].fmeth == "Attribute"){
				attrib.push(userClasses[indof].features[i]);

				var newF = userClasses[indof].features[i].fname.name;
				if(attribname.indexOf(newF) == -1){
					attribname.push(newF);
				}
				else{
					console.log("ERROR: " + userClasses[indof].features[i].fname.loc + ": Type-Check: attribute is redefineed!" + newF);
					process.exit();
				}
			}
			else if( userClasses[indof].features[i].fmeth == "Method"){
				method.push(userClasses[indof].features[i]);
				var uniqueFormal = [];
				for(var foind = 0;foind < userClasses[indof].features[i].formals.length; foind ++){
					var myformal = userClasses[indof].features[i].formals[foind];

					//check for duplicate formals
					if(uniqueFormal.indexOf(myformal.fname.name) == -1){
						uniqueFormal.push(myformal.fname.name);
					}
					else{
						console.log("ERROR: " + myformal.fname.loc + ": Type-Check: duplicate formals named!! " + myformal.fname.name);
						process.exit();
					}
			  }

				//check for undefined classes in method signatures
				var rettype = userClasses[indof].features[i].mtype;
				if(all_classes.indexOf(rettype.name) == -1){
					if(rettype.name != "SELF_TYPE"){
						console.log("ERROR: " + rettype.loc + ": Type-Check: method returns undefined type!!" + rettype.name);
						process.exit();
					}
				}

				var newF = userClasses[indof].features[i].mname.name;

				if(methodname.indexOf(newF) == -1){
					methodname.push(newF);
				}
				else{
					console.log("ERROR: " + userClasses[indof].features[i].mname.loc + ": Type-Check: method was refefined!!" + newF);
					process.exit();
				}
			}
		}

//Make sure Main has all required Cool specifications
		if(userClasses[indof].cname.name == "Main"){
			var mind = -1;
			var flag = true;

			for(var i = 0; i < method.length; i++){
				if(method[i].mname.name == "main"){
					flag = false;
					mind = i;
				}
			}
			if(flag){
				console.log("ERROR: 0: Type-Check: no main method in Main class BOI");
				process.exit();
			}

			if(mind != -1 && method[mind].formals.length != 0){
				console.log("ERROR: 0: Type-Check: main method should have no formals");
				process.exit();
			}

		}

//make sure self and SELF_TYPE are use properly
		for(var mine = 0; mine < attrib.length; mine++){
			var checktype = attrib[mine].ftype;
			var checktheatt = attrib[mine].fname;
			if(checktheatt.name == "self"){
				console.log("ERROR: " + checktheatt.loc + ": Type-Check: attribute named self!!");
				process.exit();
			}

			if(checktheatt.name == "SELF_TYPE"){
				console.log("ERROR: " + checktheatt.loc + ": Type-Check: attribute named SELF_TYPE!!");
				process.exit();
			}
		}

		userClasses[indof].attrib = attrib;
		userClasses[indof].method = method;
		//TODO: sort method alphabetically by the method's name
		// var method_name = [];
		// for (var i = 0 ; i< userClasses[indof].method.length; i++){
		// 	method_name.push(userClasses[indof].method[i].mname.name);
		// }
		// method_name.sort();
		// var sortedMethods = [];
		// // console.log("original: ", userClasses[indof].method.length);
		// for(var i =0; i < method_name.length; i++){
		// 		for(var j = 0; j<method_name.length; j++){
		// 			if(method_name[i]==userClasses[indof].method[j].mname.name){
		// 				sortedMethods.push(userClasses[indof].method[j]);
		// 			}
		// 		}
		// }
		//
		//
		// userClasses[indof].method = [];
		// for(var i =0; i< sortedMethods.length; i++){
		// 	userClasses[indof].method.push(sortedMethods[i]);
		// }
		// console.log("original: ", userClasses[indof].method.length);

		// console.log("sorted",sortedMethods);



		// console.log("sorted",userClasses[indof].method);



		// console.log(userClasses[indof].cname.name);
		// console.log(method);
		// this is ok

//if a class inherits, add the relevant features
// if the class DOES INHERIT DO THIS
		if(userClasses[indof].inherit != ""){
			// console.log("class inherits something:",userClasses[indof].cname.name);

			var parent = userClasses[indof].inherit.name;
			var pind = user_classes.indexOf(parent);

			// console.log(parent + pind);
			// console.log();
			// if the parent is a USER CLASS
			if( pind != -1 ){
				// console.log("parent is a user class:",userClasses[indof].cname.name);

				var list1 = userClasses[pind].attrib;
				var list2 = userClasses[indof].attrib;

				//parent
				var meth1 = [];
				// userClasses[pind].method;
				for(var i = 0; i < userClasses[pind].method.length; i++){
					meth1.push(userClasses[pind].method[i]);
				}
				// console.log("meth1",meth1);
				//child
				var meth2 = []
				for(var i = 0; i < userClasses[indof].method.length; i++){
					meth2.push(userClasses[indof].method[i]);
				}
				// console.log("meth2", meth2);

// console.log("original meth2", meth2);

				userClasses[indof].attrib = list1.concat(list2);
				// userClasses[indof].method = [];

				// console.log(meth1);
				// console.log("parent");
				//
				// console.log(meth2);
				// console.log("kid's length");
				var overrriden = [];
				for(var par = 0; par < meth1.length; par++){
					for(var kid = 0; kid < meth2.length; kid++){

						//type checks the Cool formals specifications
						// console.log("par",meth1[par]);
						// console.log("kid", meth2[kid]);
						if(meth2[kid].mname.name == meth1[par].mname.name){
							if(!arraysEqual(meth2[kid].formals, meth1[par].formals)){
								console.log("ERROR: " + meth2[kid].mname.loc + ": Type-Check: bad redefined formals!! " + meth2[kid].mname.name);
								process.exit();

							}
							if(meth2[kid].mtype.name != meth1[par].mtype.name){
								console.log("ERROR: " + checktheatt.loc + ": Type-Check: refefines method bad return type!! "+ meth2[kid].mname.name);
								process.exit();
							}
							// <<code>>
							// <<effective else-if>>
							// console.log(par);
							// console.log("meth1", meth1[par]);
							// overrriden.push(meth2[kid]);
							meth1[par] = meth2[kid];
							meth2.splice(kid, 1);
							kid--;

						}
						else{
							// meth1[par].definition = parent;
						}

					}
				}


				var temp = meth2;
				// console.log(temp);
				// console.log("^ is temp ^");

				userClasses[indof].method = meth1.concat(temp);
				// console.log(userClasses[indof].cname.name,userClasses[indof].method);
				// console.log("the functions being set", userClasses[indof].method);
				//checks for Cool attribute rules
				var attinname = [];
				for(var t = 0; t < userClasses[indof].attrib.length; t++){
					var checkatt = userClasses[indof].attrib[t].fname.name;
					if(attinname.indexOf(checkatt) == -1){
						attinname.push(checkatt);
					}
					else{
						console.log("ERROR: " + userClasses[indof].attrib[t].fname.loc + ": Type-Check: attribute is redefineed!" + checkatt);
						process.exit();
					}
				}
			}
			// ELSE the parent is IO or Object
			else
			{
				//Make sure built in classes aren't redefined
				if(base_classes.indexOf(parent) != -1 ){
					if(parent == "IO"){
						var meth1 = [];


						meth1.push(methabort);
						meth1.push(copy);
						meth1.push(type_name);
						meth1.push(in_int);
						meth1.push(in_string);
						meth1.push(out_int);
						meth1.push(out_string);

						// console.log("meth1");
						// console.log(meth1);

						var meth2 = userClasses[indof].method;

						//check for redefined formals
						for(var par = 0; par < meth1.length; par++){
							for(var kid = 0; kid < meth2.length; kid++){
								if(meth2[kid].mname.name == meth1[par].mname.name){
									if(!arraysEqual(meth2[kid].formals, meth1[par].formals)){
										console.log("ERROR: " + meth2[kid].mname.loc + ": Type-Check: bad redefined formals!! " + meth2[kid].mname.name);
										process.exit();
									}
									if(meth2[kid].mtype.name != meth1[par].mtype.name){
										console.log("ERROR: " + checktheatt.loc + ": Type-Check: refefines method bad return type!! "+ meth2[kid].mname.name);
										process.exit();
									}

									// console.log("splicing: ");
									// console.log(meth1[par]);
									meth1.splice(par, 1);

								}
								else{
									// meth1[par].definition = parent;
									// userClasses[indof].method.push(meth1[par]);
									// console.log("Pushing: ");
									// console.log(meth1[par]);
								}
							}
						}
						var temp = userClasses[indof].method;
						userClasses[indof].method = meth1.concat(temp);
						// console.log("all functions",userClasses[indof].method, "index", indof);
					}

					//check for redefining Object's methods
					else if(parent == "Object"){
						var meth1 = [];
		        meth1.push(methabort);
		        meth1.push(copy);
		        meth1.push(type_name);

						var meth2 = userClasses[indof].method;
						for(var par = 0; par < meth1.length; par++){
							for(var kid = 0; kid < meth2.length; kid++){
								if(meth2[kid].mname.name == meth1[par].mname.name){
									if(!arraysEqual(meth2[kid].formals, meth1[par].formals)){
										console.log("ERROR: " + meth2[kid].mname.loc + ": Type-Check: bad redefined formals!! " + meth2[kid].mname.name);
										process.exit();

									}
									if(meth2[kid].mtype.name != meth1[par].mtype.name){
										console.log("ERROR: " + checktheatt.loc + ": Type-Check: refefines method bad return type!! "+ meth2[kid].mname.name);
										process.exit();
									}
									meth1.splice(par, 1);

								}
								else{
									meth1[par].definition = "Object";

								}
							}
						}
						var temp = userClasses[indof].method;
						userClasses[indof].method = meth1.concat(temp);					}
				}
				else
				{
					console.log("ERROR: 0: Type-Check: inherits from undeclared?");
				}
			}
		}
		else{
			//if a class doesn't inherit, it inherits from Object
			var meth1 = [];
			meth1.push(methabort);
			meth1.push(copy);
			meth1.push(type_name);

			var meth2 = userClasses[indof].method;
			for(var par = 0; par < meth1.length; par++){
				for(var kid = 0; kid < meth2.length; kid++){
					if(meth2[kid].mname.name == meth1[par].mname.name){
						if(!arraysEqual(meth2[kid].formals, meth1[par].formals)){
							console.log("ERROR: " + meth2[kid].mname.loc + ": Type-Check: bad redefined formals!! " + meth2[kid].mname.name);
							process.exit();
						}
						if(meth2[kid].mtype.name != meth1[par].mtype.name){
							console.log("ERROR: " + checktheatt.loc + ": Type-Check: refefines method bad return type!! "+ meth2[kid].mname.name);
							process.exit();
						}
						meth1.splice(par, 1);

					}
					else{
						meth1[par].definition = "Object";
						// console.log("idk" + userClasses[indof].cname.name);
						// userClasses[indof].method.push(meth1[par]);
					}
				}
			}
			var temp = userClasses[indof].method;
			userClasses[indof].method = meth1.concat(temp);
		}
	}
}
// -----------------------SECION >><< DO TYPECHECKING
// -----------------------HAVE SYMBOL TABLE while do TYPECHECKING
	// --------------- FIND ERRORS HERE


// TODO: fix methods, need to have the t0, tn-1 <- formals
// and tn = return type

// Javascript, im passing objects
// passing by REFERENCE

// take in two class names
function checkInherit(parent, child){
	if(parent == child ){
		return true;
	}
	if(user_classes.indexOf(child) != -1 ){
			var childsparent = userClasses[user_classes.indexOf(child)].inherit;


			if(childsparent == ""){
				return parent == "Object" || parent == child;
			}
			else if(parent == childsparent.name){
				return true;
			}
			else{
				return checkInherit(parent, childsparent.name);
			}

	}
	else{
		// the child is a base classs
		return parent == "Object" || parent == child;
	}
}



function tcheckExp(expre, classname, objsym, metsym){
	// return a boolean t/f
	var expid = expre.ekind.etype;
	// console.log(expid, "doing a big case");
	// console.log(expre.ekind);
	switch(expid){
		case "integer":
			expre.ekind.rettype = "Int";
			break;
		case "string":
			expre.ekind.rettype = "String";
			break;
		case "bool":
			expre.ekind.rettype = "Bool";
			break;
		case "minus":
		case "times":
		case "divide":
		case "plus":
			tcheckExp(expre.ekind.val1, classname, objsym, metsym);
			tcheckExp(expre.ekind.val2, classname, objsym, metsym);
			// console.log("e1",expre.ekind.val1.ekind);
			// console.log("e2",expre.ekind.val2.ekind);

			if(expre.ekind.val1.ekind.rettype == "Int" && expre.ekind.val2.ekind.rettype == "Int"){
//				console.log("I am plus");
				expre.ekind.rettype = "Int";
			}
			else{
				console.log("ERROR: "+ expre.eloc+ ": Type-Check: arithmetic failed typchecking - yo");
				process.exit();
			}
			break;
		case "le":
		case "lt":
		case "eq":
			tcheckExp(expre.ekind.val1, classname, objsym, metsym);
			tcheckExp(expre.ekind.val2, classname, objsym, metsym);

			// console.log()
			if(check(expre.ekind.val1.ekind.rettype, ["Int", "String", "Bool"]) || check(expre.ekind.val2.ekind.rettype, ["Int", "String", "Bool"]))
			 	if(expre.ekind.val1.ekind.rettype == expre.ekind.val2.ekind.rettype){
				expre.ekind.rettype = "Bool";
//				console.log("Set rettype to bool");
			}
			else{
				console.log("ERROR: "+ expre.eloc+ ": Type-Check: equals failed typchecking");
				process.exit();
			}
//			console.log("did a thing!", expre.ekind.rettype);
			break;
		case "isvoid":
			tcheckExp(expre.ekind.value, classname, objsym, metsym);
			expre.ekind.rettype = "Bool";
			break;
		case "negate":
			tcheckExp(expre.ekind.value, classname, objsym, metsym);
			if(expre.ekind.value.ekind.rettype != "Int"){
				console.log("ERROR: "+ expre.ekind.value.eloc+ ": Type-Check: negate failed typchecking");
				process.exit();
			}
			expre.ekind.rettype = "Int";
			break;
		case "not":
			tcheckExp(expre.ekind.value, classname, objsym, metsym);
			if(expre.ekind.value.ekind.rettype != "Bool"){
				console.log("ERROR: "+ expre.ekind.value.eloc+ ": Type-Check: not failed typchecking");
				process.exit();
			}
			expre.ekind.rettype = "Bool";
			break;
		case "new":
			var mytype = expre.ekind.value.name;
			// This should be the new "Type"
			if( mytype == "SELF_TYPE"){
				expre.ekind.rettype = "SELF_TYPE";
				//TODO: SELF_TYPE STUFFFF
				// ^^^^
			}
			else{
				expre.ekind.rettype = mytype;
			}
		//TODO: Do new
			break;
		case "assign":
			var maxtype = objsym.find(classname).find(expre.ekind.eid.name);
			tcheckExp(expre.ekind.exp, classname, objsym, metsym);
			var mytype = expre.ekind.exp.ekind.rettype;
			// console.log("ekind: ", expre.ekind.exp

			if(maxtype == mytype){
				// this is OK
				expre.ekind.rettype = mytype;
			}
			else{
				if(checkInherit(maxtype, mytype)){
					expre.ekind.rettype = mytype;
					// console.log(mytype, "the inheritance was ok");
				}
				else{
					// console.log(maxtype, ":parent, child:", mytype);
					console.log("ERROR: "+ expre.eloc+ ": Type-Check: assign is taihen checking failed typchecking");
					process.exit();
				}
			}
			break;
	case "identifier":
			// expre.rettype = "String";
			if(expre.ekind.name == "self"){
				expre.ekind.rettype = "SELF_TYPE";
				break;
			}
			// console.log(objsym.find(classname).find(expre.ekind.name));
			// console.log(expre.ekind.name);

			// if(objsym.find(classname).find(expre.ekind.name)=="" || objsym.find(classname).find(expre.ekind.name)=='undefined'){
			// 	console.log("ERROR: "+ expre.eloc+ ": Type-Check: ideintifier out of scope");
			// 	process.exit();
			// }
			// else{
			// 	console.log("not entering");
			// 	console.log("symb table: ", objsym.find(classname).find(expre.ekind.name));
			// }


			if(objsym.find(classname).find(expre.ekind.name) != "I didn't find anything master" ){
				expre.ekind.rettype = objsym.find(classname).find(expre.ekind.name);
			}
			else{
							// console.log("cant find: ",expre.ekind.name);
				console.log("ERROR: "+ expre.eloc+ ": Type-Check: ideintifier checking failed typchecking");
				// console.log(objsym.find(classname).print());
				process.exit();
			}
			break;
		case "if":
			tcheckExp(expre.ekind.cond, classname, objsym, metsym);


			var condi = expre.ekind.cond.ekind.rettype;


			// console.log("condi: ",condi);
			// console.log("t2: ",t2);
			// console.log("t3: ",
			// t3);


			if(condi != "Bool"){
				console.log("ERROR: "+ expre.ekind.cond.eloc+ ": Type-Check: if condition not Booleantype");
				process.exit();
			}
			tcheckExp(expre.ekind.itrue, classname, objsym, metsym);
			tcheckExp(expre.ekind.ifalse, classname, objsym, metsym);
			var t2 = expre.ekind.itrue.ekind.rettype;
			var t3 = expre.ekind.ifalse.ekind.rettype;
			var lCA = leastCommonAncestor(t2, t3);
			// console.log(lCA, " from the if statement");
			expre.ekind.rettype = lCA;

			break;
		case "block":
			var last_type = "";
			for(var q = 0; q < expre.ekind.value.length; q++){
				tcheckExp(expre.ekind.value[q], classname, objsym, metsym);
				last_type = expre.ekind.value[q].ekind.rettype;
//				console.log(last_type);
			}
			expre.ekind.rettype = last_type;
			break;
		case "while":
			tcheckExp(expre.ekind.cond, classname, objsym, metsym);
			var condi = expre.ekind.cond.ekind.rettype;
			// console.log(condi);

//			var t2 = expre.ekind.value.ekind.rettype;
			if(condi != "Bool"){
				console.log("ERROR: "+ expre.ekind.cond.eloc+ ": Type-Check: while condition not Booleantype");
				process.exit();
			}
			tcheckExp(expre.ekind.value, classname, objsym, metsym);

			expre.ekind.rettype = "Object";
			break;
		case "case":
			// console.log(expre.ekind.exp);
			tcheckExp(expre.ekind.exp, classname, objsym, metsym);

			var types = [];
			var branch_types = [];

			for(var q = 0; q < expre.ekind.action.length; q++){

				if(branch_types.indexOf(expre.ekind.action[q].atype.name)==-1){
						branch_types.push(expre.ekind.action[q].atype.name);
				}
				else{
					console.log("ERROR: "+ expre.ekind.action[q].id.loc+ ": Type-Check: repeated branches of case");
					process.exit();
				}
				// if(!(expre.ekind.action[q].id.name in  branches)){
				// 	branches[expre.ekind.action[q].id.name]= [expre.ekind.action[q].atype.name];
				// }
				// else{
				// 	var temp_types = branches[expre.ekind.action[q].id.name]
				// 	if(temp_types.indexOf(expre.ekind.action[q].atype.name)==-1){
				// 		branches[expre.ekind.action[q].id.name].push(expre.ekind.action[q].atype.name);
				// 	}
				// 	else{
				// 		console.log("ERROR: "+ expre.ekind.action[q].id.loc+ ": Type-Check: repeated branches of case");
				// 			 		process.exit();
				// 	}
				// }

				if(expre.ekind.action[q].atype.name == "SELF_TYPE"){
					console.log("ERROR: "+ expre.ekind.action[q].atype.loc + ": Type-Check: self-type as a branch of case");
					process.exit();
				}

				// console.log("current case branch", expre.ekind.action[q].id.name);
				// console.log("current case branch type", expre.ekind.action[q].atype.name);

				// TODO: push onto objsym
				objsym.find(classname).add(expre.ekind.action[q].id.name, expre.ekind.action[q].atype.name);
				tcheckExp(expre.ekind.action[q].exp, classname, objsym, metsym);
				objsym.find(classname).remove(expre.ekind.action[q].id.name);
				types.push(expre.ekind.action[q].exp.ekind.rettype);
			}
			// have a list of types
			var basecase = leastCommonAncestor(types[0], types[1]);
			for (var i =1; i< types.length; i++){
				basecase= leastCommonAncestor(basecase, types[i]);
			}
			// console.log("case should return", basecase);
			// console.log("which is:", expre.ekind.exp.ekind.rettype);
			// if(basecase == "SELF_TYPE"){
			// 	expre.ekind.rettype = expre.ekind.exp.ekind.rettype;
			// }
			// else{
				expre.ekind.rettype = basecase;

			// }

			break;
		case "dynamic_dispatch":
			// type is undefined or null, because it's not static!!
			// console.log("exp",expre.ekind);
			tcheckExp(expre.ekind.exp, classname, objsym, metsym);
			var t0 = expre.ekind.exp.ekind.rettype;
			var theMethod;
			if(t0 == "SELF_TYPE"){
				theMethod = metsym.find(classname).find(expre.ekind.did.name);
			}
			else{
				theMethod = metsym.find(t0).find(expre.ekind.did.name);
			}
			if(theMethod == "I didn't find anything master"){
				console.log("ERROR: " + expre.eloc+ ": Type-Check: dynamic dispatch error not existing!!");
				process.exit();

			}
//			console.log(theMethod);
			var finalOne = theMethod[theMethod.length - 1];

			// console.log(expre.ekind.arglist.length);
			// console.log(theMethod.length);
			// console.log(expre.ekind, "expre");
			// console.log(theMethod, "theMethod");
			// console.log(metsym.find("D").print());
			if(expre.ekind.arglist.length == (theMethod.length-1)){
				for(var q = 0; q < theMethod.length-1; q++){
					// console.log(theMethod[q], "the method");
					// console.log(expre.ekind.arglist[q], "the method");
					tcheckExp(expre.ekind.arglist[q], classname, objsym, metsym);

					if(!checkInherit(theMethod[q], expre.ekind.arglist[q].ekind.rettype)){
						// it is false!!
						console.log("ERROR: " + expre.eloc+ ": Type-Check: dynamic dispatch error bad formals!!");
						process.exit();
					}
				}
			}
			else{
				console.log("ERROR: " + expre.eloc+ ": Type-Check: dynamic dispatch error yo");
				process.exit();
			}
			// SO FAR OK!!!
			if(finalOne == "SELF_TYPE"){
				expre.ekind.rettype = t0;
			}
			else{
				expre.ekind.rettype = finalOne;
			}
//			console.log("whoooo", expre.ekind.rettype);
			break;
		case "self_dispatch":

			var theMethod = metsym.find(classname).find(expre.ekind.eid.name);
			// console.log(expre.eloc, theMethod);
			if(theMethod == "I didn't find anything master"){
				console.log("ERROR: " + expre.eloc+ ": Type-Check: self dispatch error not existing!!");
				process.exit();

			}
			// console.log("arg list: ",expre.ekind.args);
			var finalOne = theMethod[theMethod.length - 1];
			// console.log(expre.ekind);

			if(expre.ekind.args.length == theMethod.length-1){



				for(var q = 0; q < theMethod.length-1; q++){
					// console.log("parent: ",theMethod[q]);
					// console.log("child: ",expre.ekind.args[q]);
					tcheckExp(expre.ekind.args[q], classname, objsym, metsym);
					if(!checkInherit(theMethod[q], expre.ekind.args[q].ekind.rettype)){
						// it is false!!
						console.log("ERROR: " + expre.eloc+ ": Type-Check: self dispatch error bad formals!!");
						process.exit();
					}
				}
			}
			else{
				// console.log("line number", expre.eloc);
				// console.log("the passed in things",expre.ekind.eid.name);
				// console.log("formal params, inc ret type", theMethod.length);
				console.log("ERROR: " + expre.eloc+ ": Type-Check: self dispatch error yo");
				process.exit();
			}
			// SO FAR OK!!!
			expre.ekind.rettype = finalOne;
			break;
		case "let":
			var t2 = "";
			var thingsleton = [];

			// console.log(exprse.ekind.letlist[0]);
			for(var i = 0; i < expre.ekind.letlist.length; i++){
				if( expre.ekind.letlist[i].exp == 'undefined' || expre.ekind.letlist[i].exp== ""){
					var t0 = expre.ekind.letlist[i].atype.name;

					objsym.find(classname).add(expre.ekind.letlist[i].id.name, t0);
					// console.log("first push", expre.ekind.letlist[i].id.name, "; type: ", t0);
					thingsleton.push(expre.ekind.letlist[i].id.name);
				}
				else{
					// it has AN attached exp
					var t0 = expre.ekind.letlist[i].atype.name;

					tcheckExp(expre.ekind.letlist[i].exp, classname, objsym, metsym);
					var t1 = expre.ekind.letlist[i].exp.ekind.rettype;
					// console.log("t1",t1);

					if(t1 == "SELF_TYPE"){
						if(checkInherit(t0, t1)){
							// t0 = "SELF_TYPE";
						}
						else{
							console.log("ERROR: " + expre.eloc+ ": Type-Check: self type let error");
							process.exit();
						}
					}else{
						// t0 = t0;
					}
					if(checkInherit(t0, t1)){
						objsym.find(classname).add(expre.ekind.letlist[i].id.name, t0);
						thingsleton.push(expre.ekind.letlist[i].id.name);
					}
					else{
						// console.log("t0", t0);
						// console.log("t1", t1);
						console.log("ERROR: " + expre.eloc+ ": Type-Check: let expression error yo t0, t1");
						process.exit();
					}
				}
			}

			tcheckExp(expre.ekind.inexp, classname, objsym, metsym);
			t2 = expre.ekind.inexp.ekind.rettype;
			// console.log("t2", t2);

			for(var i = 0; i < expre.ekind.letlist.length; i++){
					objsym.find(classname).remove(thingsleton[i])
			}

			expre.ekind.rettype = t2;
			break;
		case "static_dispatch":
			tcheckExp(expre.ekind.exp, classname, objsym, metsym);
			var eo = expre.ekind.exp.ekind.rettype;
			// console.log(expre.ekind.exp.e
				// kind);
				// console.log(checkInherit(expre.ekind.dtype.name, eo));
				// console.log("method table: ", metsym.find(expre.ekind.dtype.name).print());
			if(checkInherit(expre.ekind.dtype.name, eo)){
				var theMethod = metsym.find(expre.ekind.dtype.name).find(expre.ekind.did.name);
				// console.log("classname", expre.ekind.dtype.name);
				// console.log("expre",expre.ekind.did.name);
				if(theMethod == "I didn't find anything master"){
					console.log("ERROR: " + expre.eloc+ ": Type-Check: static dispatch error not existing!!");
					process.exit();

				}
				var finalOne = theMethod[theMethod.length - 1];

				if(expre.ekind.arglist.length == theMethod.length-1){
					for(var q = 0; q < theMethod.length-1; q++){
						tcheckExp(expre.ekind.arglist[q], classname, objsym, metsym);

						if(!checkInherit(theMethod[q], expre.ekind.arglist[q].ekind.rettype)){
							// it is false!!
							console.log("the method",theMethod[q]);
							console.log("the child",expre.ekind.arglist[q]

						);

							console.log("ERROR: " + expre.eloc+ ": Type-Check: static dispatch error bad formals!!");
							process.exit();
						}
					}
				}
				else{
					console.log("ERROR: " + expre.eloc+ ": Type-Check: static dispatch error wrong # params");
					process.exit();
				}
			}
			else{
				// console.log(eo, ":child type, parent:", expre.ekind.dtype.name);
				console.log("ERROR: " + expre.eloc+ ": Type-Check: static dispatch error yo");
				process.exit();
			}
			if(finalOne == "SELF_TYPE"){
				expre.ekind.rettype = e0;
			}
			else{
				expre.ekind.rettype = finalOne;
			}
			break;
		default:
			// console.log("enter default", expid);
			expre.rettype = "DIVYA DON'T COMMENT ME OUT";


	}
//	console.log(expre);
//	return expre;
}

//checking methods
function tcheckMeth(mymeth, classname, objsym, metsym){
	var supposedRet = mymeth.mtype.name;
	// add the allowable parameters
	for(var q = 0; q < mymeth.formals.length; q++){
		objsym.find(classname).add(mymeth.formals[q].fname.name, mymeth.formals[q].ftype.name);
	}
	// type-checks the body of the expression
	tcheckExp(mymeth.mbody, classname, objsym, metsym);
	var actualRet = mymeth.mbody.ekind.rettype;

	// console.log("s", supposedRet);
	// console.log("a", actualRet);

	if(!checkInherit(supposedRet, actualRet)){
		console.log(mymeth.mbody);
		console.log("ERROR: " + mymeth.mname.loc + ": Type-Check: method issue!");
		console.log("parent", supposedRet, "child:", actualRet, "in", mymeth.mname.name);
	}
	// mymeth.rettype = supposedRet;
	for(var q = 0; q < mymeth.formals.length; q++){
		objsym.find(classname).remove(mymeth.formals[q].fname.name, mymeth.formals[q].ftype.name);
	}
	//pop off method parameters
	return true;
}

function tcheckAtt(myatt, classname, objsym, metsym){
	var aname = myatt.fname.name;

	if(myatt.finit.length < 1){
//		console.log(myatt);
		myatt.rettype = objsym.find(classname).find(myatt.fname.name);
		// whoo no typechecking to do!
	}
	else{
//		console.log(myatt.finit);
		tcheckExp(myatt.finit, classname, objsym, metsym);

		var bodytype = myatt.finit.ekind.rettype;
//		console.log(myatt.finit);

		if(checkInherit(objsym.find(classname).find(aname), bodytype) || objsym.find(classname).find(aname)==bodytype){
			// console.log("ok!!!", ob
			// jsym.find(classname).find(aname));
		}
		else{
			console.log("ERROR: "+ myatt.finit.eloc+ ": Type-Check: i!!!!", bodytype, "should be", objsym.find(classname).find(aname));
			process.exit();
		}

	}
}
function tcheckClass(mclass, classname, objsym, metsym){
	// I am given a symbol table, and a user-class
	var className = mclass.cname.name;
	//TODO:
	// attributes next

	for(var i = 0; i < mclass.method.length; i++){

		tcheckMeth(mclass.method[i], classname, objsym, metsym);
	}
	for(var i = 0; i < mclass.attrib.length; i++){

		tcheckAtt(mclass.attrib[i], classname, objsym, metsym);
	}

//	return checkMe;
}

all_classes.sort();

var osym = new symboltable.SymbolTable();
var msym = new symboltable.SymbolTable();

for(ind in all_classes){
	var clname = all_classes[ind];
	if(user_classes.indexOf(clname) != -1){
		// this is a user class
		var indof = user_classes.indexOf(clname);
		var myClass = userClasses[indof];

//		console.log(myClass);

		osym.add(clname, new symboltable.SymbolTable());
		msym.add(clname, new symboltable.SymbolTable());


		for(var i = 0; i < myClass.attrib.length; i++){
			osym.find(clname).add(myClass.attrib[i].fname.name, myClass.attrib[i].ftype.name);
		}
		for(var i = 0; i < myClass.method.length; i++){
			var methformals = [];
			for(var q = 0; q < myClass.method[i].formals.length; q++){
				methformals.push(myClass.method[i].formals[q].ftype.name);
			}
			methformals.push(myClass.method[i].mtype.name);
			msym.find(clname).add(myClass.method[i].mname.name, methformals);

		}

		// console.log(clname, msym.find(clname).print());

//		console.log(osym.find(clname).print(), clname);
//		console.log(msym.find(clname).print(), clname);

	}
	else{
		// this is a basic class
		osym.add(clname, new symboltable.SymbolTable());
		msym.add(clname, new symboltable.SymbolTable());

		// your mom gets object
		msym.find(clname).add("abort", ["Object"]);
		msym.find(clname).add("copy", ["SELF_TYPE"]);
		msym.find(clname).add("type_name", ["String"]);


		if(clname == "String"){
			msym.find(clname).add("length", ["Int"]);
			msym.find(clname).add("concat", ["String", "String"]);
			msym.find(clname).add("substr", ["Int", "Int", "String"]);
		}
		else if(check(clname, ["Int", "Bool"])){
			// just get all of object's stuff?
		}
		else if (clname == "IO"){

			msym.find(clname).add("out_string", ["String", "SELF_TYPE"]);
			msym.find(clname).add("out_int", ["Int", "SELF_TYPE"]);
			msym.find(clname).add("in_string", ["String"]);
			msym.find(clname).add("in_int", ["Int"]);

		}
		else{
//			console.log(clname);
		}
//		console.log(msym.find(clname).print(), clname);
	}

}



//


//console.log(msym.print());


for(ind in all_classes){

	if(check(all_classes[ind], user_classes)){
		var indof = user_classes.indexOf(all_classes[ind]);

		// pass in my symTbl! Should be nothing in it!
		tcheckClass(userClasses[indof], user_classes[indof], osym, msym);
//		if(tcheckIt != ""){
//			// print an error, maybe?
//		}
	}
}


//----------------------- SECTION 7: Create File and Begin Recursion

//all_classes.sort();
// move this over some
writeFirst("");

  write("class_map\n"+ all_classes.length + "\n");
  var ind = 0;
  for(ind in all_classes){
  	write("" + all_classes[ind] + "\n");
  	if(check(all_classes[ind], user_classes)){
  		var indof = user_classes.indexOf(all_classes[ind]);
  		write(userClasses[indof].attrib.length + "\n");
  		for(var i = 0; i < userClasses[indof].attrib.length; i++){

  			if( userClasses[indof].attrib[i].finit != ""){
  				write("initializer\n"+ userClasses[indof].attrib[i].fname.name + "\n" +  userClasses[indof].attrib[i].ftype.name + "\n");
  				output_exp(userClasses[indof].attrib[i].finit, true);
  			}
  			else{
  				write("no_initializer\n"+ userClasses[indof].attrib[i].fname.name + "\n" +  userClasses[indof].attrib[i].ftype.name + "\n");
  			}
  		}
  	}
  	else{
  		write("0\n");
  	}
  }

// --------------------- finish the class mapping
// --------------------- commented out to test imp map
function baseinheritObject(intype){
	var meth1 = [];

	if(intype == "String"){


		meth1.push(methabort);
		meth1.push(copy);
		meth1.push(type_name);

		meth1.push(meconcat);
		meth1.push(melen);
		meth1.push(mesubs);
		// meth1.push();
	}
	else if(intype == "IO"){


		meth1.push(methabort);
		meth1.push(copy);
		meth1.push(type_name);
		meth1.push(in_int);
		meth1.push(in_string);
		meth1.push(out_int);
		meth1.push(out_string);

	}
	else{
	meth1.push(methabort);
	meth1.push(copy);
	meth1.push(type_name);
	}

	write(meth1.length + "\n");
	for(var i = 0; i < meth1.length; i++){
			var internalmeth = meth1[i];
			write(internalmeth.mname.name + "\n");
			write(internalmeth.formals.length + "\n");
			// write formal names?
			for (var q = 0; q < internalmeth.formals.length; q++){
				write(internalmeth.formals[q].fname.name + "\n");
			}
			write(internalmeth.definition + "\n");
			write(internalmeth.mbody.eloc + "\n");
			write(internalmeth.mtype.name + "\n");
			write("internal\n");
			write(internalmeth.definition + "."+ internalmeth.mname.name + "\n");

	}
}

write("implementation_map\n"+ all_classes.length + "\n");
var ind = 0;
//console.log("baseclasses: ",base_classes);
//console.log("all classes: ", all_classes);
for(ind in all_classes){
//	console.log("ind", ind);

	write("" + all_classes[ind] + "\n");

	if(check(all_classes[ind], user_classes)){
		// console.log(userClasses[indof].method);
		var indof = user_classes.indexOf(all_classes[ind]);

		write(userClasses[indof].method.length + "\n");
		// Go through all of the methods in a class
		for(var i = 0; i < userClasses[indof].method.length; i++){
			// write the method name
			// write the number of formals and then the actual formal names
			write(userClasses[indof].method[i].mname.name + "\n");
			write(userClasses[indof].method[i].formals.length + "\n");

			for(var q = 0; q < userClasses[indof].method[i].formals.length; q++){
				write(userClasses[indof].method[i].formals[q].fname.name + "\n");
			}
			//Check if this is an internal methid
			// console.log("I am looping through class: "+ userClasses[indof].cname.name);
			// console.log("the method is from", userClasses[indof].method[i].definition);
			if (check(userClasses[indof].method[i].definition, base_classes)){
				var internalmeth = userClasses[indof].method[i];
				// write(internalmeth.mname.name + "\n");
				// write(internalmeth.formals.length + "\n");
//				console.log("internal: ",userClasses[indof].method[i].definition);
				// console.log("internal func",internalmeth.mname.name

				write(internalmeth.definition + "\n");
				write(internalmeth.mbody.eloc + "\n");
				write(internalmeth.mtype.name + "\n");
				write("internal\n");
				write(internalmeth.definition + "."+ internalmeth.mname.name + "\n");


			}
			// this is not an internal method, so do other stuff
			else{
				// console.log(userClasses[indof].cname.name);
				// write(userClasses[indof].method[i].mtype.name);

				// console.log("userdefined method name",userClasses[indof].method[i].mname.name);

				write(userClasses[indof].method[i].definition + "\n");
				output_exp(userClasses[indof].method[i].mbody, true);
					//<<do stuff>>

			}
			// for loop for all the methds!
		}
	}
	else{
		// console.log(all_classes[ind]);
		baseinheritObject(all_classes[ind]);
				// write("0\n");
	}
}

// ------------------ SECTION IDK: Parent map
  write("parent_map\n"+ (all_classes.length - 1) + "\n");
  for(ind in all_classes){
  	var indof = user_classes.indexOf(all_classes[ind]);
  	if(indof == -1){
  		// this is a base class
  		if(all_classes[ind] != "Object"){
  			write(all_classes[ind] + "\n");
  			write("Object\n");
  		}
  	}
  	else{
  		// this is a user class, it either inherits a thing
  		// or it inherits object
  		write(all_classes[ind] + "\n");
  		if(userClasses[indof].inherit == ""){
  			// it inherits nothing
  			write("Object\n");

  		}
  		else{
  			write(userClasses[indof].inherit.name +"\n");
  		}
  	}
  }

//------------------SECTION: NEXT ANNOTATED AST
// ---------------- Look @ python code!
// go through user classes
// and use their features
function outputID(identifier){
	write(identifier.loc+ "\n");
	write(identifier.name + "\n");

}

write(user_classes.length + "\n");
for(ind in user_classes){
	 var thisClass = userClasses[ind];

	 outputID(thisClass.cname);
	if(thisClass.inherit != ""){
		write("inherits\n");
		outputID(thisClass.inherit);
	}
	else{
		write("no_inherits\n");
	}

	write(thisClass.features.length + "\n");
	for(var i = 0; i < thisClass.features.length; i++){
		var myFeat = thisClass.features[i];

		if(myFeat.fmeth == "Attribute"){
			if(myFeat.finit == ""){
				write("attribute_no_init\n");
				outputID(myFeat.fname);
				outputID(myFeat.ftype);
			}
			else{
				write("attribute_init\n");
				outputID(myFeat.fname);
				outputID(myFeat.ftype);
				output_exp(myFeat.finit, true);
			}
		}
		else if(myFeat.fmeth == "Method"){
			write("method\n");
			outputID(myFeat.mname);
			// formals
			write(myFeat.formals.length + "\n");
			for(var q = 0; q < myFeat.formals.length; q++){
				outputID(myFeat.formals[q].fname);
				outputID(myFeat.formals[q].ftype);
			}
			outputID(myFeat.mtype);
			output_exp(myFeat.mbody, true);
		}
		else{
			console.log("impossible yo");
		}
	}

 }


//-------------------------------------------------------























//-------------------SECTION 8: Helper Functions

//Create File
function writeFirst(data){
	fs.writeFileSync(fname, data);
}

//Write to File
function write(data){
	fs.appendFileSync(fname, data);
}

//Check if 2 arrays are equal
function arraysEqual(arr1, arr2) {

    if(arr1.length != arr2.length){
        return false;
			}
    for(var i = arr1.length; i--;) {
			// looping through the formals
        if(arr1[i].fname.name != arr2[i].fname.name){
            return false;
					}
				if(arr1[i].ftype.name != arr2[i].ftype.name){
		        return false;
					}
    }
    return true;
}

//check if an item is in a list
function check(item, list){
//	console.log(item, list);
	for (var index = 0; index < list.length; index++){
		if(item == list[index]){
			return true;
		}
	}
	return false;
}

function inheritList(classname, listsofar){
	var indof = user_classes.indexOf(classname);

	listsofar.unshift(classname);
	if(indof == -1){
		listsofar.unshift("Object");
		return listsofar;
	}
	else{
		var parent = userClasses[indof].inherit;
		if(parent == ""){
			listsofar.unshift("Object");
			return listsofar;
		}
		else{
			// console.log(parent.name);
			return inheritList(parent.name, listsofar);
		}
	}
}

function leastCommonAncestor(t1, t2){
	var l1 = inheritList(t1, []);
	var l2 = inheritList(t2, []);

	l1 = l1.reverse();
	l2 = l2.reverse();
	for(var i = 0; i < l1.length; i++){
		for(var j = 0; j < l2.length; j++){
			if(l1[i] == l2[j]){
				// console.log(l1[i]);
				return l1[i];
			}
		}
	}
}
