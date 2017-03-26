rm -rf ref/
rm -rf output/
mkdir ref
mkdir output
# for i in temp_test/*.cl
# do
# bn=$(basename $i)
# filename="${bn%%.*}"
# echo "file: $filename"
# ./cool $i --imp-map --out output/$filename
# ./cool $i --parse --out ref/$filename
# node main.js ref/"$filename.cl-ast"
# diff output/"$filename.cl-type" ref/"$filename.cl-type"
# done

filename="zselftyperedeclared"
echo "file: $filename"
./cool temp_test/"$filename.cl" --imp-map --out output/$filename
./cool temp_test/"$filename.cl" --parse --out ref/$filename
node main.js ref/"$filename.cl-ast"
diff output/"$filename.cl-type" ref/"$filename.cl-type"
