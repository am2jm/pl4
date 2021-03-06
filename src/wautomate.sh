rm -rf ref/
rm -rf output/
mkdir ref
mkdir output
for i in testcases/*.cl
do
bn=$(basename $i)
filename="${bn%%.*}"
echo "file: $filename"
./cool.exe $i --type --out output/$filename
./cool.exe $i --parse --out ref/$filename
node main.js ref/"$filename.cl-ast"
diff output/"$filename.cl-type" ref/"$filename.cl-type" --strip-trailing-cr
done


#filename=""
#echo "the errors $filename"
#./cool.exe $i --class-map --out output/$filename
#./cool.exe $i --parse --out ref/$filename
#node main.js ref/"$filename.cl-ast"

#filename="sort-list"
#./cool.exe testcases/"$filename.cl" --class-map --out output/$filename
#./cool.exe testcases/"$filename.cl" --parse --out ref/$filename
#node main.js ref/"$filename.cl-ast"
#diff output/"$filename.cl-type" ref/"$filename.cl-type" --strip-trailing-cr

#filename="test-ddynamic"
#./cool.exe testcases/"$filename.cl" --class-map --out output/$filename
#./cool.exe testcases/"$filename.cl" --parse --out ref/$filename
#node main.js ref/"$filename.cl-ast"
#diff output/"$filename.cl-type" ref/"$filename.cl-type" --strip-trailing-cr