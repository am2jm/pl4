function topsort(edges){
	var sorted = [];
	var found = [];
	var node = [];
	// with items [node, deg]
	
//	console.log("my edges " + edges.length);
	
	for(var i = 0; i < edges.length; i++){
		var curr = edges[i];
		
		
		if(curr.length != 1){
//			console.log("current is " + curr);
			if(found.indexOf(curr[0]) == -1){
				// the parent is not in the list!
				found.push(curr[0]);
				node.push(0);
			}
			else{
				var ind = found.indexOf(curr[0]);
				// nothing because it's the parent
			}
			
			if(found.indexOf(curr[1]) == -1){
				// the child is not in the list!
				found.push(curr[1]);
				node.push(1);
			}
			else{
				var ind = found.indexOf(curr[1]);
				node[ind] = node[ind] + 1;
				// the cild is in the list
			}
		}
		else{
			// It is a single childless node!
			if(found.indexOf(curr) == -1){
				// it is not in it
				found.push(curr[0]);
				node.push(0);
			}
		}
	}
	
	while(node.indexOf(0) != -1){
	// there are nodes of 0 degree
		var mine = node.indexOf(0);
			
	
	}
	
	return sorted;
}


console.log("Hello:");
graph = [];

// A -> B
// Z standalone
graph.push(["A", "B"]);
graph.push(["B", "C"]);
graph.push(["Z"]);

// answers:
// A, B, Z, C
// Z, A, B, C
// A, Z, B, C

var done = topsort(graph);
//console.log(done);