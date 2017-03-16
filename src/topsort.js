//input = []
//// #read input from stdin and store in variable input
//
//// #dictionary of nodes -> outgoing nodes
//x = {}
//// #dictionary of nodes -> incoming nodes
//y = {}
//// #list of starting nodes (no incoming edges)
//start_nodes = []
//
//// #loop through input 2 at a time
//for (var i =0; i < graph.length){
//
//    // #remove edges that do not belong in start_nodes
//    if start not in start_nodes:
//        start_nodes.append(start)
//    if end in start_nodes:
//        start_nodes.remove(end)
//
//    #map edges to their incoming edges
//    if end not in y:
//        y[end] = [start]
//    else:
//        temp_list = y[end]
//        temp_list.append(start)
//        y[end]= temp_list
//    #map edges to their outgoing edges
//    if start not in x:
//        x[start] = [end]
//    else:
//        temp_list = x[start]
//        temp_list.append(end)
//        x[start]= temp_list
//
//
//#create list of nodes with no incoming edges edges
//for key, value in y.items():
//    for snode in start_nodes:
//        if snode == key:
//            start_nodes.remove(snode)
//
//#call topologicalSort
//stack = []
//topologicalSort(start_nodes,stack,x,y)
//







function = topologicalSort(S, L, x, y) {
    //loop through the queue until it is empty
    while (S.length>0){
        sort(S)
        var node = S[0]

        //remove it from the queue and add it to the results
        var i = S.indexOf(node);
        if(i != -1) {
	         S.splice(i, 1);
         }
        L.splice(0, 0, node)
        if(check(node, x)){
          x[node].forEach(function(m) {
              y[m].remove(node)
              if (y[m].length == 0){
                i = y.indexOf(m);
                if(i != -1) {
                   y.splice(i, 1);
                 }
                  S.push(m)
                }
              });
          i = x.indexOf(node);
          if(i != -1) {
             x.splice(i, 1);
           }
    }
}
    //if there are any edges in the incoming edge graph, there must be a cycle

    if (S.length<=0){
    if (y.length> 0){
        console.log("cycle");
      }
    else{
    //else there is a valid solution
        L.reverse()
        L.forEach(function(items){
          console.log(items)
      });
    }
  }
}
