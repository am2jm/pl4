fs = require('fs');
topsort = require("./topsort.js");

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
}
function Attribute(fname, ftype, initals){
	this.fname = fname;
	this.ftype = ftype;
	this.finit = initals;
	this.fmeth = "Attribute";
}
function Formal(fname, ftype){
	this.fname = fname;
	this.ftype = ftype;
}
function Exp(eloc, ekind){
	this.eloc = eloc;
	this.ekind = ekind;
}
function Id(loc, name){
	this.etype = "identifier";
	this.loc = loc;
	this.name = name;
}
function Integer(ival){
	this.etype = "integer";
	this.value = ival;
}
function Bool(ival){
	this.etype = "bool";
	this.value = ival;
}
function String(ival){
	this.etype = "string";
	this.value = ival;
}
function Not(ival){
	this.etype = "not";
	this.value = ival;
}
function Comp(mtype, item1, item2){
	this.etype = mtype;
	this.val1 = item1;
	this.val2 = item2;
}
function Negate(item){
	this.etype = "negate";
	this.value = item;
}
function IsVoid(etype, line){
	this.etype = etype;
	this.value = line;
}
function NewType(etype, item){
	this.etype = etype;
	this.value = item;
}
function Block(etype, evalue){
	this.etype = etype;
	this.value = evalue;
}
function Assign(etype, eid, exp){
	this.etype = etype;
	this.eid = eid;
	this.exp = exp;
}
function SDispatch(etype, eid, argsa){
	this.etype = etype;
	this.eid = eid;
	this.args = argsa;
}
function DDispatch(ekind, eexp, etype, eid, args){
	this.etype = ekind;
	this.exp = eexp;
	this.dtype = etype;
	this.did = eid;
	this.arglist = args;
}
function If(etype, econd, itrue, ifalse){
	this.etype = etype;
	this.cond = econd;
	this.itrue = itrue;
	this.ifalse = ifalse;
}
function While(etype, econd, ival){
	this.etype = etype;
	this.cond = econd;
	this.value = ival;
}
function Action(myid, mytype, myexp){
	this.id = myid;
	this.atype = mytype;
	this.exp = myexp;
}
function Case(myexp, actlist){
	this.etype = "case";
	this.exp = myexp;
	this.action = actlist;
}
function Let(letlist, inexp){
	this.etype = "let";
	this.letlist = letlist;
	this.inexp = inexp;
}
//------------SECTION 2: Read File and build AST-------------------------------

function readFile(){
	var contents = fs.readFileSync(process.argv[2]).toString();
	contents = contents.split("\n");
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

//helper function to consume input from the ast
function read(){
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
		console.log("nope!");
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
		ekind = new Comp(citem, item1, item2);
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
		sdlist = [];
		var myid = read_id();
		var len = read();
		for( var i = 0; i < len; i++){
			sdlist.push(read_exp());
		}
		ekind = new SDispatch("self_dispatch", myid, sdlist);
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
function output_exp(expression){

	var exptype = expression.ekind.etype;
	write("" + expression.eloc + "\n");

	//check every type of expression
	if(check(exptype, ["integer", "string"])){
		write(exptype + "\n" + expression.ekind.value  + "\n");
	}
	else if (exptype == "not"){
		write("not"  + "\n")
		output_exp(expression.ekind.value);
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
		output_exp(expression.ekind.val1);
		output_exp(expression.ekind.val2);
	}
	else if(check(exptype, ["negate", "isvoid"])){
		write(exptype + "\n");
		output_exp(expression.ekind.value);
	}
	else if(exptype == "new"){
		write(exptype + "\n");
		write(expression.ekind.value.loc + "\n" + expression.ekind.value.name+ "\n");
	}
	else if(exptype == "self_dispatch"){
		write(exptype + "\n");
		write(expression.ekind.eid.loc + "\n" + expression.ekind.eid.name + "\n" + expression.ekind.args.length + "\n");

		for(var q = 0; q < expression.ekind.args.length; q++){
			output_exp(expression.ekind.args[q]);
		}
	}
	else if(exptype == "if"){
		write(exptype + "\n");
		output_exp(expression.ekind.cond);
		output_exp(expression.ekind.itrue);
		output_exp(expression.ekind.ifalse);
	}
	else if(exptype == "while"){
		write(exptype + "\n");
		output_exp(expression.ekind.cond);
		output_exp(expression.ekind.value);
	}
	else if(exptype == "assign"){
		write(exptype + "\n");
		write(expression.ekind.eid.loc + "\n" + expression.ekind.eid.name + "\n");
		output_exp(expression.ekind.exp);

	}
	else if(exptype == "block"){
		write(exptype + "\n");
		write(expression.ekind.value.length + "\n");
		for(var q = 0; q < expression.ekind.value.length; q++){
			output_exp(expression.ekind.value[q]);
		}
	}
	else if(exptype == "case"){
		write(exptype + "\n");
		output_exp(expression.ekind.exp);

		var len = expression.ekind.action.length;
		var mylist = expression.ekind.action;
		write(len + "\n");
		for(var q = 0; q < len; q++){
			write(mylist[q].id.loc + "\n" + mylist[q].id.name + "\n");
			write(mylist[q].atype.loc + "\n" + mylist[q].atype.name + "\n");
			output_exp(mylist[q].exp);
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
			}
			else{
				write("let_binding_init\n");
			}
			write(mylist[q].id.loc + "\n" + mylist[q].id.name + "\n");
			write(mylist[q].atype.loc + "\n" + mylist[q].atype.name + "\n");
		}

		output_exp(expression.ekind.inexp);
	}
	else if(check(exptype, ["static_dispatch", "dynamic_dispatch"])){
		write(exptype + "\n");
		output_exp(expression.ekind.exp);

		if(exptype == "static_dispatch"){
			write(expression.ekind.dtype.loc + "\n" + expression.ekind.dtype.name + "\n");
		}
		write(expression.ekind.did.loc + "\n" + expression.ekind.did.name + "\n");

		var mylist = expression.ekind.arglist;
		var len = mylist.length;
		write(len + "\n");
		for(var q = 0; q < len; q++){
			output_exp(mylist[q]);
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
				// process.exit();
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
		//TODO:
		//TODO:
		// console.log(userClasses[indof].cname.name);
		// console.log(method);
		// this is ok

//if a class inherits, add the relevant features
// if the class DOES INHERIT DO THIS
		if(userClasses[indof].inherit != ""){

			var parent = userClasses[indof].inherit.name;
			var pind = user_classes.indexOf(parent);

			// console.log(parent + pind);
			// console.log();
			// if the parent is a USER CLASS
			if( pind != -1 ){

				var list1 = userClasses[pind].attrib;
				var list2 = userClasses[indof].attrib;

				//parent
				var meth1 = userClasses[pind].method;
				//child
				var meth2 = userClasses[indof].method;

				userClasses[indof].attrib = list1.concat(list2);
				// userClasses[indof].method = [];

				// console.log(meth1);
				// console.log("parent");
				//
				// console.log(meth2);
				// console.log("kid's length");
				for(var par = 0; par < meth1.length; par++){
					for(var kid = 0; kid < meth2.length; kid++){

						//type checks the Cool formals specifications
						// console.log(meth1[par]);
						// console.log(meth2[kid]);
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
							meth1.splice(par, 1);

						}
						else{
							// meth1[par].definition = parent;
						}

					}

				}
				var temp = userClasses[indof].method;
				// console.log(temp);
				// console.log("^ is temp ^");
				userClasses[indof].method = meth1.concat(temp);

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
						var out_string = new Method(new Id(0, "out_string"), [new Formal(
								new Id(0, "x"), new Id(0, "String"))], new Id(0, "SELF_TYPE"), new Exp(0, new Integer(555)), "IO");
						var out_int = new Method(new Id(0, "out_int"), [new Formal(
								new Id(0, "x"), new Id(0, "Int"))], new Id(0, "SELF_TYPE"), new Exp(0, new Integer(555)), "IO");
						var in_string = new Method(new Id(0, "in_string"), [], new Id(0, "String"), new Exp(0, new Integer(555)), "IO");
						var in_int = new Method(new Id(0, "in_int"), [], new Id(0, "Int"), new Exp(0, new Integer(555)), "IO");
						var methabort = new Method(new Id(0, "abort"), [], new Id(0, "Object"), new Exp(0, new Integer(555)), "Object");
		        // console.log(methabort.formals.length + " this is how many formals");
		        var type_name = new Method(new Id(0, "type_name"), [], new Id(0, "String"), new Exp(0, new Integer(555)), "Object");
		        var copy = new Method(new Id(0, "copy"), [], new Id(0, "SELF_TYPE"), new Exp(0, new Integer(555)), "Object");

						meth1.push(methabort);
						meth1.push(copy);
						meth1.push(type_name);
						meth1.push(in_int);
						meth1.push(in_string);
						meth1.push(out_int);
						meth1.push(out_string);

						console.log("meth1");
						console.log(meth1);

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

									console.log("splicing: ");
									console.log(meth1[par]);
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
						console.log("all functions",userClasses[indof].method, "index", indof);
					}

					//check for redefining Object's methods
					else if(parent == "Object"){
						var meth1 = [];
						var methabort = new Method(new Id(0, "abort"), [], new Id(0, "Object"), new Exp(0, new Integer(555)));
		        // console.log(methabort.formals.length + " this is how many formals");
		        var type_name = new Method(new Id(0, "type_name"), [], new Id(0, "String"), new Exp(0, new Integer(555)));
		        var copy = new Method(new Id(0, "copy"), [], new Id(0, "SELF_TYPE"), new Exp(0, new Integer(555)));
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
			var methabort = new Method(new Id(0, "abort"), [], new Id(0, "Object"), new Exp(0, new Integer(555)));
			var type_name = new Method(new Id(0, "type_name"), [], new Id(0, "String"), new Exp(0, new Integer(555)));
			var copy = new Method(new Id(0, "copy"), [], new Id(0, "SELF_TYPE"), new Exp(0, new Integer(555)));
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

//----------------------- SECTION 7: Create File and Begin Recursion

all_classes.sort();
writeFirst("class_map\n"+ all_classes.length + "\n");
// var ind = 0;
// for(ind in all_classes){
// 	write("" + all_classes[ind] + "\n");
// 	if(check(all_classes[ind], user_classes)){
// 		var indof = user_classes.indexOf(all_classes[ind]);
// 		write(userClasses[indof].attrib.length + "\n");
// 		for(var i = 0; i < userClasses[indof].attrib.length; i++){
//
// 			if( userClasses[indof].attrib[i].finit != ""){
// 				write("initializer\n"+ userClasses[indof].attrib[i].fname.name + "\n" +  userClasses[indof].attrib[i].ftype.name + "\n");
// 				output_exp(userClasses[indof].attrib[i].finit);
// 			}
// 			else{
// 				write("no_initializer\n"+ userClasses[indof].attrib[i].fname.name + "\n" +  userClasses[indof].attrib[i].ftype.name + "\n");
// 			}
// 		}
// 	}
// 	else{
// 		write("0\n");
// 	}
// }

// --------------------- finish the class mapping
// --------------------- commented out to test imp map
function baseinheritObject(intype){
	var meth1 = [];
	var methabort = new Method(new Id(0, "abort"), [], new Id(0, "Object"),
	new Exp(0, new Integer(555)), "Object");
	// console.log(methabort.formals.length + " this is how many formals");
	var type_name = new Method(new Id(0, "type_name"), [], new Id(0, "String"),
	new Exp(0, new Integer(555)), "Object");
	var copy = new Method(new Id(0, "copy"), [], new Id(0, "SELF_TYPE"),
	new Exp(0, new Integer(555)), "Object");
	if(intype == "String"){
		var melen = new Method(new Id(0, "length"), [], new Id(0, "Int"),
		new Exp(0, new Integer(555)), "String");
		var meconcat = new Method(new Id(0, "concat"),
		[new Formal(new Id(0, "s"), new Id(0, "String"))], new Id(0, "String"),
		new Exp(0, new Integer(555)), "String");
		var mesubs = new Method(new Id(0, "substr"),
		[new Formal(new Id(0, "i"), new Id(0, "Int")),
		new Formal(new Id(0, "l"), new Id(0, "Int"))], new Id(0, "String"),
		new Exp(0, new Integer(555)), "String");

		meth1.push(methabort);
		meth1.push(meconcat);
		meth1.push(copy);
		meth1.push(melen);
		meth1.push(mesubs);
		meth1.push(type_name);
		// meth1.push();
	}
	else if(intype == "IO"){
		var out_string = new Method(new Id(0, "out_string"), [new Formal(
				new Id(0, "x"), new Id(0, "String"))], new Id(0, "SELF_TYPE"), new Exp(0, new Integer(555)), "IO");
		var out_int = new Method(new Id(0, "out_int"), [new Formal(
				new Id(0, "x"), new Id(0, "Int"))], new Id(0, "SELF_TYPE"), new Exp(0, new Integer(555)), "IO");
		var in_string = new Method(new Id(0, "in_string"), [], new Id(0, "String"), new Exp(0, new Integer(555)), "IO");
		var in_int = new Method(new Id(0, "in_int"), [], new Id(0, "Int"), new Exp(0, new Integer(555)), "IO");

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
for(ind in all_classes){
	write("" + all_classes[ind] + "\n");

	if(check(all_classes[ind], user_classes)){
		// console.log(userClasses[indof].method);
		var indof = user_classes.indexOf(all_classes[ind]);
		write(userClasses[indof].method.length + "\n");
		for(var i = 0; i < userClasses[indof].method.length; i++){
			write(userClasses[indof].method[i].mname.name + "\n");
			write(userClasses[indof].method[i].formals.length + "\n");
			for(var q = 0; q < userClasses[indof].method[i].formals.length; q++){
				write(userClasses[indof].method[i].formals[q].fname.name + "\n");
			}
			// 	// write(userClasses[indof].method[i].definition + "."+ userClasses[indof].method[i].mname.name+ "\n");
			// 	// console.log(userClasses[indof].method[i]);
			// 	// output_exp(userClasses[indof].method[i].mbody);
			// }

			if (check(userClasses[indof].method[i].definition, base_classes)!=-1){
				var internalmeth = userClasses[indof].method[i];
				// write(internalmeth.mname.name + "\n");
				// write(internalmeth.formals.length + "\n");
				write(internalmeth.definition + "\n");
				write(internalmeth.mbody.eloc + "\n");
				write(internalmeth.mtype.name + "\n");
				write("internal\n");
				write(internalmeth.definition + "."+ internalmeth.mname.name + "\n");


			}
			else{
					output_exp(userClasses[indof].method[i].mbody);

			}

			// for loop for all the methds!



			// console.log(userClasses[indof].cname.name + "class name");
			// console.log(userClasses[indof].method[i]);
			// console.log(userClasses[indof].method[i].definition);
			// console.log()
			// if( userClasses[indof].attrib[i].finit != ""){
			// 	write("initializer\n"+ userClasses[indof].attrib[i].fname.name + "\n" +  userClasses[indof].attrib[i].ftype.name + "\n");
			// 	output_exp(userClasses[indof].attrib[i].finit);
			// }
			// else{
			// 	write("no_initializer\n"+ userClasses[indof].attrib[i].fname.name + "\n" +  userClasses[indof].attrib[i].ftype.name + "\n");
			// }
		}
	}
	else{
		console.log(all_classes[ind]);
		baseinheritObject(all_classes[ind]);
				// write("0\n");
	}
}

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
	for (var index = 0; index < list.length; index++){
		if(item == list[index]){
			return true;
		}
	}
	return false;
}
