

var x = new SymbolTable();
x.add("4","5");
x.add("7","6");
console.log(x.table());
console.log(x.find("4"));
console.log(x.mem('4'));


function SymbolTable() {
    var table = {};

    this.clear = function() {
        table = {};
    };

    this.table = function(){
        return table;
    };

    this.add = function(x, y) {
        if(Object.keys(table).indexOf(x) > -1) {
            // push onto stack
            table[x].push(y);
        } else {
            // create a new stack
            table[x] = [y];
        }
    };

    this.find = function(x) {
        if(Object.keys(table).indexOf(x) > -1) {
            return table[x][table[x].length-1];
        } else {
          console.log(Object.keys(table).indexOf("4"));
            throw "not found";
        }
    };

    this.mem = function(x) {
      console.log(Object.keys(table));
        return x in table;
    };

    this.remove = function(x) {
        if(Object.keys(table).indexOf(x) > -1) {
            table[x].pop();
        }
    };
}
