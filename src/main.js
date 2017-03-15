
fs = require('fs');//, readline = require('readline');

//------------SECTION 1: define types--------------------------------------

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
function Exp(eloc, ekind){
	this.eloc = eloc;
	this.ekind = ekind;
}
function Id(loc, name){
	this.etype = "identifier";
	this.loc = loc;
	this.name = name;
}
function Formal(fname, ftype){
	this.fname = fname;
	this.ftype = ftype;
}
function CoolClass(cname, inhert, features){
	this.cname = cname;
	this.inherit = inhert;
	this.features = features;
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
	this.cond = myexp;
	this.action = actlist;
}
//------------SECTION 2: Read File and build AST-------------------------------

function readFile(){
	var contents = fs.readFileSync(process.argv[2]).toString();
	contents = contents.split(/[\r\n]+/);
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
	var items = [];
	for(var i = 0; i < llength; i++){
		items.push(worker());
	}
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


//	console.log(citem + " reading this item!" + process.argv[2]);

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
		console.log("invalid!");
	}
}

function read_formal(){
	var fname = read_id();
	var ftype = read_id();
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
		var myexp = read_exp();
		var len = read();
		
		for(var i = 0; i < len; i++){
			var myid = read_id();
			var mytype = read_id();
			var myexp = read_exp();
			
			actlist.push(new Action(myid, mytype, myexp));
		}
		
		ekind = new Case(myexp, actlist);
	}
	else{
		console.log("Have not done:" + citem + " " + process.argv[2]);
	}
//	console.log(ekind + "");
	return new Exp(eloc, ekind);
}

function check(item, list){
	for (var index = 0; index < list.length; index++){
		if(item == list[index]){
			return true;
		}
	}
	return false;
}

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


for(var q = 0; q < userClasses.length; q++){
	// Ensure that we inherit from allowable things
	// this is checking all of the user classes
	
//	console.log(myinherit);
	if(userClasses.inherit == ""){
		// no inherit
	}
	else{
		var myinherit = userClasses[q].inherit.name;
		
		if( check(myinherit, ["Int", "String", "Bool"]) ){
			console.log("ERROR: " + userClasses[q].inherit.loc + ": Type-Check: cannot inherit from Integer!");
			break;
		}
		else if( !check(myinherit, all_classes) ){
			console.log(myinherit + " am inheriiting?");
			console.log("ERROR: " + userClasses[q].inherit.loc + ": Type-Check: inherits from undefined class BOI " + myinherit);
			break;
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
		output_exp(expression.ekind.cond);
		
		var len = expression.ekind.action.length;
		var mylist = expression.ekind.action;
		write(len + "\n");
		for(var q = 0; q < len; q++){
			write(mylist[q].id.loc + "\n" + mylist[q].id.name + "\n");
			write(mylist[q].atype.loc + "\n" + mylist[q].atype.name + "\n");
			output_exp(mylist[q].exp);
		}
	}
	//---- whoooo didn't catch it
	else{
		write("is it here?" + exptype + "\n");
	}
}


all_classes.sort();

writeFirst("class_map\n"+ all_classes.length + "\n");
var ind = 0;


for(ind in all_classes){
	write("" + all_classes[ind] + "\n");

	if(check(all_classes[ind], user_classes)){
		var indof = user_classes.indexOf(all_classes[ind]);
		var attrib = [];
		var len = userClasses[indof].features.length;

		for(var i = 0; i < len; i++){
			if (userClasses[indof].features[i].fmeth == "Attribute"){
				attrib.push(userClasses[indof].features[i]);
			}
			else if( userClasses[indof].features[i].fmeth == "Method"){
			}
			else{
				console.log("Neither an attribute or a function");
			}
		}

		write(attrib.length + "\n");
		for(var i = 0; i < attrib.length; i++){

			if(attrib[i].initials != ""){
				write("initializer\n"+ attrib[i].fname.name + "\n" +  attrib[i].ftype.name + "\n");

				output_exp(attrib[i].finit);
			}
			else{
				write("no_initializer\n"+ attrib[i].fname.name + "\n" +  attrib[i].ftype.name + "\n");
			}
		}

	}
	else{
		write("0\n");
	}
}
