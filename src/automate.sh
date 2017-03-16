rm -rf ref/
rm -rf output/
mkdir ref
mkdir output
for i in testcases/*.cl
do
bn=$(basename $i)
filename="${bn%%.*}"
echo $filename
./cool $i --class-map --out output/$filename
./cool $i --parse --out ref/$filename
node main.js ref/"$filename.cl-ast"
# diff output/"$filename.cl-type" ref/"$filename.cl-type"
done
