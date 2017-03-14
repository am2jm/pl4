
fs = require('fs');//, readline = require('readline');

//var rd = readline.createInterface({
//	input: fs.createReadStream(process.argv[2]),
////	output: process.stdout,
//	console: false
//});

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
function CoolClass(cname, inherit, features){
	this.cname = cname;
	this.inherit = inherit;
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

function read(){
	var item = myAST[myindex];
	myindex++;
	return item;
}


function read_list(worker){
	var llength = read();
//	console.log("readinglist of size " + llength);
	var items = [];
	for(var i = 0; i < llength; i++){
//		console.log(worker + " is my worker");
		items.push(worker());
	}
	return items;
}
function readCoolProgram(){
//	console.log("Starting to read");
	read_list(read_cool_class);
}

function read_cool_class(){
	var cname = read_id();
	var inherit = "";
	var citem = read();
//		console.log("Class name: " + cname.name);
	if(citem == "inherits"){
		inherit = read_id();
	}
	else if(citem == "no_inherits"){
		inherit = "non_inherits";
	}
	else{
		console.log("nope!");
	}
//	}
	var features = read_list(read_features);
//	return new CoolClass(cname, inherit, features)
	userClasses.push(new CoolClass(cname, inherit, features));
	return new CoolClass(cname, inherit, features);
}

function read_features(){
	var citem = read();
	
	
//	console.log(citem + " reading this item!" + process.argv[2]);
	
	if(citem == "attribute_no_init"){
		var fname = read_id();
		var ftype = read_id();
//		console.log("Attr: " + fname.name + " " + ftype.name);
		return new Attribute(fname, ftype, []);
	}
	else if(citem == "attribute_init"){
		var fname = read_id();
		var ftype = read_id();
		var finit = read_exp();
//		console.log("Attr_i: " + fname.name + " " + ftype.name);
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
	else{
		console.log("Have not done:" + citem + process.argv[2]);
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
//console.log(myindex);

//
// Setup the base classes here so we know what they are
// Also take notes of all of the user classes that were defined
//

var base_classes = ["Int", "String", "Bool", "IO", "Object"];
var user_classes = [];
for (var q = 0; q < userClasses.length; q++) {
	user_classes.push(userClasses[q].cname.name);
}
var all_classes = base_classes.concat(user_classes);
//console.log(all_classes);
//console.log("were all: following user:");
//console.log(user_classes);
//console.log("user-classes!");
//console.log(userClasses);



for(var q = 0; q < userClasses.length; q++){
	// Ensure that we inherit from allowable things
	// this is checking all of the user classes
	
	if(userClasses[q].inherit == "non_inherits"){
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
			console.log("ERROR: " + userClasses[q].inherit.loc + ": Type-Check: you inherits from not-ok class BOI " + myinherit);
			break;
		}
	}
}
var fname = process.argv[2].slice(0, -4);
//fname += "-type2";
fname += "-type";

//console.log(fname);

// This creates the file to be written to
// ensures it completely replaces any existing files
function writeFirst(data){
	fs.writeFileSync(fname, data);
}

// a function we can call to do all the writing
// will just append to the file to write all the rest of
// the class map
function write(data){
	fs.appendFileSync(fname, data);
}

// A function that will output each expression that can be found, will handle all the types of expressions here
function output_exp(expression){
//	console.log(expression);
	// TODO: wrap Integer so we can check for type integer

	write("" + expression.eloc + "\n");	
	if(check(expression.ekind.etype, ["integer", "string"])){
		write(expression.ekind.etype + "\n" + expression.ekind.value  + "\n");
	}
	else if (expression.ekind.etype == "not"){
//		console.log("my value!", expression.ekind.value);
		write("not"  + "\n")
		output_exp(expression.ekind.value);
//		console.log("in not " + expression.ekind.value);
	}
	else if (expression.ekind.etype == "bool"){
		write(expression.ekind.value  + "\n");
//		console.log(expression.ekind);	
	}
	else if(expression.ekind.etype == "identifier"){
		write("identifier\n" + expression.ekind.loc + "\n");
		write(expression.ekind.name + "\n");
	}
	else if(check(expression.ekind.etype, ["lt", "eq", "le", "plus", "minus", "times", "divide"])){
		write(expression.ekind.etype + "\n");
		output_exp(expression.ekind.val1);
		output_exp(expression.ekind.val2);
	}
	else if(check(expression.ekind.etype, ["negate", "isvoid"])){
		write(expression.ekind.etype + "\n");
		output_exp(expression.ekind.value);
	}
	else if(expression.ekind.etype == "new"){
		write(expression.ekind.etype + "\n");
		write(expression.ekind.value.loc + "\n" + expression.ekind.value.name+ "\n");
	}
	else{
		write("is it here?\n");
	}
}

//
// Here is the actual code to create and print the class map
// The above functions are called from here generally
//
all_classes.sort();
//console.log(all_classes);

writeFirst("class_map\n"+ all_classes.length + "\n");
var ind = 0;
//console.log(all_classes);


for(ind in all_classes){
	write("" + all_classes[ind] + "\n");


	if(check(all_classes[ind], user_classes)){
		// we can do stuff with it
		var indof = user_classes.indexOf(all_classes[ind]);
		var attrib = [];
//		console.log(userClasses[indof]);
		var len = userClasses[indof].features.length;
		for(var i = 0; i < len; i++){
			if (userClasses[indof].features[i].fmeth == "Attribute"){
				attrib.push(userClasses[indof].features[i]);
			}
			else if( userClasses[indof].features[i].fmeth == "Method"){
				// do stuff later!
			}
			else{
				console.log("You DUN FUCKED UPP");
			}
		}
//		console.log(attrib.length);

		write(attrib.length + "\n");
		for(var i = 0; i < attrib.length; i++){
//			console.log(attrib[i]);
			
			if(attrib[i].initials != ""){
				write("initializer\n"+ attrib[i].fname.name + "\n" +  attrib[i].ftype.name + "\n");
				
				output_exp(attrib[i].finit);
			}
			else{
				write("no_initializer\n"+ attrib[i].fname.name + "\n" +  attrib[i].ftype.name + "\n");
			}
//			write("where is undef");
		}
		
	}
	else{
		write("0\n");
//		console.log(all_classes[ind] + " should have 0");
	}
}
