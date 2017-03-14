rm -rf ref/
rm -rf output/
mkdir ref
mkdir output
#for i in testcases/*.cl
#do
#bn=$(basename $i)
#filename="${bn%%.*}"
#./cool.exe $i --class-map --out output/$filename
#./cool.exe $i --parse --out ref/$filename
#node main.js ref/"$filename.cl-ast"
#diff output/"$filename.cl-type" ref/"$filename.cl-type" --strip-trailing-cr
#done



filename="test-new"
./cool.exe testcases/test-new.cl --class-map --out output/$filename
./cool.exe testcases/test-new.cl --parse --out ref/$filename
node main.js ref/"$filename.cl-ast"
diff output/"$filename.cl-type" ref/"$filename.cl-type" --strip-trailing-cr