fs = require('fs');//, readline = require('readline');
topsort = require("./topsort.js")
//------------SECTION 1: define types--------------------------------------
function CoolClass(cname, inhert, features){
	this.cname = cname;
	this.inherit = inhert;
	this.features = features;
	this.attrib = [];
	this.method = [];
}
function Method(mname, formals, mtype, mbody){
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
//	contents = contents.split("\r\n");
	contents = contents.split("\n");
	contents.pop();
	return contents;
}

var myAST = readFile();
var myindex = 0;
var userClasses = [];
var identifiers = [];

//helper function to consume input from the ast
function read(){
	var item = myAST[myindex];
	myindex++;
	return item;
}

//------------SECTION 3: Traverse AST and -------------------------------
function read_list(worker){
	var llength = read();
//	console.log("list length: " + llength);
	var items = [];
	for(var i = 0; i < llength; i++){
		items.push(worker());
	}
//	console.log(items);
	return items;
}
function readCoolProgram(){
	read_list(read_cool_class);
}

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

	var features = read_list(read_features);
	userClasses.push(new CoolClass(cname, inherit, features));
	return new CoolClass(cname, inherit, features);
}

function read_features(){
	var citem = read();
	// console.log(citem + " reading this item!" + process.argv[2]);

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
		return new Method(mname, formals, mtype, mbody);
	}
	else{
//		console.log("invalid! " + citem);
	}
}

function read_formal(){
	var fname = read_id();
	var ftype = read_id();

	// console.log(fname);
	// console.log(ftype);
	if(fname.name == "self" || ftype.name == "self"){
		console.log("ERROR: " + fname.loc + ": Type-Check: cannot use self as a parameter!!");
		process.exit();
	}
	return new Formal(fname, ftype);
}

function read_id(){
	var loc = read();
	var name = read();
	return new Id(loc, name);
}

function read_exp(){
	var eloc = read();
	var ekind = "";
	var citem = read();
//	console.log("My expression type: " + citem);

	if(citem == "integer"){
		var ival = read();
		ekind = new Integer(ival);
	}
	else if(citem == "not"){
		ekind = new Not(read_exp());
	}
	else if(check(citem, ["true", "false"])){
		ekind = new Bool(citem);
//		console.log(ekind + "hello");
	}
	else if(citem == "string"){
		var ival = read();
		ekind = new String(ival);
	}
	else if(citem == "identifier"){
//		var ival = read();
//		var iloc = read();
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
//		console.log("I'm void?" + citem);
		var item = read_exp();
		ekind = new IsVoid(citem, item);
//		console.log(ekind);
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
//	console.log(ekind + "");
	return new Exp(eloc, ekind);
}

//---------- Helper function often used
function check(item, list){
	for (var index = 0; index < list.length; index++){
		if(item == list[index]){
			return true;
		}
	}
	return false;
}


//---------- Beginning to actually read the cool program! 
readCoolProgram();


var base_classes = ["Int", "String", "Bool", "IO", "Object"];
var user_classes = [];
for (var q = 0; q < userClasses.length; q++) {
	user_classes.push(userClasses[q].cname.name);
}
var all_classes = base_classes.concat(user_classes);
//console.log(all_classes);
//console.log("were all: following user:");
//console.log(user_classes);

// Check to make sure there is a main class!
if(user_classes.indexOf("Main") == -1){
	console.log("ERROR: 0: Type-Check: no Main class BOI");
	process.exit();
}
for(var x = 0; x < user_classes.length; x++){
	for(var y = 0; y < user_classes.length; y++){
		if(x != y){
			if(user_classes[x] == user_classes[y]){
				// the things gets redefined
				var index = user_classes.lastIndexOf(user_classes[x]);
				console.log("ERROR: "+ userClasses[index].cname.loc + ": Type-Check: class got redefinedd!");
				process.exit();
			}
		}
	}
}


for(var q = 0; q < userClasses.length; q++){
	// Ensure that we inherit from allowable things
	// this is checking all of the user classes

//	console.log(myinherit);
	if(userClasses[q].inherit == ""){
		// no inherit
	}
	else{
		var myinherit = userClasses[q].inherit.name;
//		console.log(userClasses[q]);

		if( check(myinherit, ["Int", "String", "Bool"]) ){
			console.log("ERROR: " + userClasses[q].inherit.loc + ": Type-Check: cannot inherit from Integer!");
			process.exit();
		}
		else if( !check(myinherit, all_classes) ){
//			console.log(myinherit + " am inheriiting?");
			console.log("ERROR: " + userClasses[q].inherit.loc + ": Type-Check: inherits from undefined class BOI " + myinherit);
			process.exit();
		}
		else if( myinherit == userClasses[q].cname.name){
			console.log("ERROR: 0: Type-Check: I inherit from myself! " + myinherit);
			process.exit();
		}
	}
}
var fname = process.argv[2].slice(0, -4);
fname += "-type";


//-------------------SECTION X: Helper Functions

function writeFirst(data){
	fs.writeFileSync(fname, data);
}

function write(data){
	fs.appendFileSync(fname, data);
}

// A function that will output each expression that can be found, will handle all the types of expressions here
function output_exp(expression){

	var exptype = expression.ekind.etype;


	write("" + expression.eloc + "\n");
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
	//---- whoooo didn't catch it
	else{
		write("is it here?" + exptype + "\n");
		// because this should never be called!
	}
}

// ---------- Need to: inheritance to print all attribs

var graph = [];
var loners = [];
for(var i = 0; i < user_classes.length; i++){
	var indof = user_classes.indexOf(user_classes[i]);

	if(userClasses[indof].inherit != ""){
		var parent = userClasses[indof].inherit.name;
		var child = userClasses[indof].cname.name;
//		console.log(child + "'s parent is: " + parent);

		graph.push([parent, child]);
	}
	else{
		var item = userClasses[indof].cname.name;
		loners.push(item);
	}
}
try{
//	console.dir(tsort(graph));
	graph = topsort.sortTopo(graph);
//	console.log(graph);
}
catch (err){
//	console.log(err);
	console.log("ERROR: 0: Type-Check: inheritance cycle there be");
	process.exit();
	//-- I errored!
	// There is a cycle
}

graph = graph.concat(loners);
// console.log(graph);

// ---------- Now each class knows its attributs and methods
// -- now figure out all the attributes each should hold!


// console.log(" length " + graph.length);



for(var ind = 0; ind < graph.length; ind ++){
//	if(check(all_classes[ind], user_classes)){
//		var indof = user_classes.indexOf(all_classes[ind]);
//	console.log(ind + "")
//	console.log(graph[ind]);
	if(check(graph[ind], user_classes)){
		var indof = user_classes.indexOf(graph[ind]);

//		console.log(graph[ind] + " checking this has " + indof + " in user clases " + userClasses[indof].cname.name );

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
				var newF = userClasses[indof].features[i].mname.name;
				if(methodname.indexOf(newF) == -1){
					methodname.push(newF);
				}
				else{
					console.log("ERROR: " + userClasses[indof].features[i].mname.loc + ": Type-Check: method was refefined!!" + newF);
					process.exit();
				}
			}
			else{
				console.log("Neither an attribute or a function");
			}
		}
		if(userClasses[indof].cname.name == "Main"){
			var mind = -1;
//			var flag = true;
			
			for(var i = 0; i < method.length; i++){
				if(method[i].mname.name == "main"){
//					flag = false;
					mind = i;
				}
			}
//			if(flag){
//				console.log("ERROR: 0: Type-Check: no main method in Main class BOI");
//				process.exit();
//			}
			
			if(mind != -1 && method[mind].formals.length != 0){
				console.log("ERROR: 0: Type-Check: main method should have no formals");
				process.exit();
			}
			
		}
//		
		userClasses[indof].attrib = attrib;
//		console.log(attrib + " belong to " + userClasses[indof].cname.name);

		userClasses[indof].method = method;

		if(userClasses[indof].inherit != ""){
			// I inherit
			var parent = userClasses[indof].inherit.name;
			var pind = user_classes.indexOf(parent);

			if( pind != -1 ){
	//			console.log(userClasses);
//				console.log(parent + " is the parent with index " + pind + " and attribs " + userClasses[pind].attrib);

				var list1 = userClasses[pind].attrib;
				var list2 = userClasses[indof].attrib;
//				console.log("parent: " + list1 + " child: " + list2);
//				console.log(list1.concat(list2));

				userClasses[indof].attrib = list1.concat(list2);
			}
			else
			{
				// does not exist
				// or is system class
				if(base_classes.indexOf(parent) != -1 ){
					// do nothing
					// this is OK
				}
				else
				{
					console.log("ERROR: 0: Type-Check: inherits from undeclared?");
				}

			}

		}
		else{
//				console.log("I inherit from nothing");
		}
//		console.log(userClasses[indof].cname.name + "'s attributes: " + userClasses[indof].attrib);
//		console.log()
	}
	else{
//		console.log("is the probolem here");
//		console.log(graph[ind]);
	}
}

//----------- After sorting all the classes, print stuff!!
all_classes.sort();
writeFirst("class_map\n"+ all_classes.length + "\n");
var ind = 0;


for(ind in all_classes){
	write("" + all_classes[ind] + "\n");

	if(check(all_classes[ind], user_classes)){
		var indof = user_classes.indexOf(all_classes[ind]);

//		console.log(userClasses[indof].cname.name + " has attrib" + userClasses[indof].attrib);

		write(userClasses[indof].attrib.length + "\n");
		for(var i = 0; i < userClasses[indof].attrib.length; i++){
//			console.log(userClasses[indof].attrib[i]);

			if( userClasses[indof].attrib[i].finit != ""){
				write("initializer\n"+ userClasses[indof].attrib[i].fname.name + "\n" +  userClasses[indof].attrib[i].ftype.name + "\n");

				output_exp(userClasses[indof].attrib[i].finit);
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
