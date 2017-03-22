topsort = require("./topsort.js");

var graph = [];

graph.push(["A", "B"]);
graph.push(["B", "A"]);

doSort();

graph = [];

graph.push(["A", "B"]);
graph.push(["B", "C"]);
graph.push(["C", "D"]);
graph.push(["C", "E"]);
graph.push(["C", "F"]);
graph.push(["C", "G"]);
graph.push(["C", "R"]);
graph.push(["W", "Z"]);
graph.push(["U", "I"]);
graph.push(["C", "S"]);
graph.push(["C", "V"]);
graph.push(["V", "X"]);

doSort();

graph = [];

graph.push(["M", "IO"]);
graph.push(["A", "B"]);
graph.push(["C", "R"]);
graph.push(["W", "Z"]);
graph.push(["V", "X"]);

doSort();

graph = [];

doSort();

function doSort(){
	try{
		var output = topsort.sortTopo(graph);
//		console.log(output);
		console.log("Sorting me: " + output);
	}catch(err){
		console.log(err);
		console.log("Winston we have a problem!");

	}
}