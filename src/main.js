
fs = require('fs');//, readline = require('readline');

//var rd = readline.createInterface({
//	input: fs.createReadStream(process.argv[2]),
////	output: process.stdout,
//	console: false
//});

function Integer(ival){
	this.value = ival;
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
function Exp(eloc, ekind){
	this.eloc = eloc;
	this.ekind = ekind;
}
function Id(loc, name){
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

function readFile(){
	var contents = fs.readFileSync(process.argv[2]).toString();
	contents = contents.split("\r\n")
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
		console.log("nope!");
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
	else{
//		console.log("Do the other expressions! " + citem);
	}
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


var base_classes = ["Int", "String", "Bool", "IO", "Object"];
var user_classes = [];
for (ind in userClasses) {
	user_classes.push(userClasses[ind].cname.name);
}
var all_classes = base_classes.concat(user_classes);
//console.log(all_classes);

for (ind in userClasses){
	// Ensure that we inherit from allowable things
	var myinherit = userClasses[ind].inherit.name;
//	console.log(myinherit);
	if(myinherit == ""){
		// no inherit
	}
	else if( check(myinherit, ["Int", "String", "Bool"]) ){
		console.log("ERROR: " + userClasses[ind].inherit.loc + ": Type-Check: cannot inherit from Integer!");
		break;
	}
	else if( !check(myinherit, all_classes) ){
		console.log("ERROR: " + userClasses[ind].inherit.loc + ": Type-Check: inherits from undefined class " + myinherit);
		break;
	}
}
var fname = process.argv[2].slice(0, -4);
fname += "-type2";
//fname += "-type";

//console.log(fname);

function writeFirst(data){
	fs.writeFileSync(fname, data, function(err){
		if(err){
			return console.log(err);
		}
	});
}

function write(data){
	fs.appendFileSync(fname, data, function(err){
		if(err){
			return console.log(err);
		}
	});
}

function output_exp(expression){
//	console.log(expression.ekind);
	// TODO: wrap Integer so we can check for type integer
	
	write("" + expression.eloc + "\n");

	write("integer\n" + expression.ekind.value  + "\n");

}

all_classes.sort();
//console.log(all_classes);

writeFirst("class_map\n"+ all_classes.length + "\n");
var ind = 0;
//console.log(all_classes);


for(ind in all_classes){
	write(all_classes[ind] + "\n");
	
	
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
		
		}
	}
	else{
		write("0\n");
//		console.log(all_classes[ind] + " should have 0");
	}
}












