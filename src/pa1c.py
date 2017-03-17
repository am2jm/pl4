import sys

def topologicalSort(S, L, x, y):
    #loop through the queue until it is empty
    while len(S)>0:

        #pop the minimum node
        node = min(S)

        #remove it from the queue and add it to the results
        S.remove(node)
        L.insert(0, node)

        #loop through all of the node's outgoing edges (if it exists)
        if(node in x):
            for m in x[node]:

                #for each outgoing edges, incoming edge, remove node
                y[m].remove(node)

                #if the current outgoing edge no longer has incoming edges, add it to the queue
                if len(y[m]) == 0:
                    y.pop(m)
                    S.append(m)
            #remove the node from the outgoing edge graph
            x.pop(node)

    #if there are any edges in the incoming edge graph, there must be a cycle
    if len(y) > 0:
        print("cycle")
    else:
    #else there is a valid solution
        L.reverse()
        for items in L:
            print(items)


if __name__ == "__main__":
    input = []
    #read input from stdin and store in variable input
    for line in sys.stdin:
        input.append(line.strip('\n'))
    #dictionary of nodes -> outgoing nodes
    x = {}
    #dictionary of nodes -> incoming nodes
    y = {}
    #list of starting nodes (no incoming edges)
    start_nodes = []

    #loop through input 2 at a time
    for index in range(0,len(input),2):
        start = input[index+1]
        end = input[index]

        #remove edges that do not belong in start_nodes
        if start not in start_nodes:
            start_nodes.append(start)
        if end in start_nodes:
            start_nodes.remove(end)

        #map edges to their incoming edges
        if end not in y:
            y[end] = [start]
        else:
            temp_list = y[end]
            temp_list.append(start)
            y[end]= temp_list
        #map edges to their outgoing edges
        if start not in x:
            x[start] = [end]
        else:
            temp_list = x[start]
            temp_list.append(end)
            x[start]= temp_list


    #create list of nodes with no incoming edges edges
    for key, value in y.items():
        for snode in start_nodes:
            if snode == key:
                start_nodes.remove(snode)

    #call topologicalSort
    stack = []
    topologicalSort(start_nodes,stack,x,y)

#This was my attempt at a recursive topologicalSort
# def modifiedDFS(graph,v,visited, stack):
#     if visited[v] == "Being Visited":
#         print("cycle")
#         return "cycle"
#     if v in graph and v is "Unvisited":
#         visited[v] = "Being Visited"
#         graph[v].sort()
#         graph[v].reverse()
#         for i in graph[v]:
#             modifiedDFS(graph, i, visited, stack)
#         visited[v] = "Visited"
#     stack.insert(0,v)
