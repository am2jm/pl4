#!/bin/bash
./cool --lex test.cl
python generate.py hs.cl-lex
for i in *.cl-lex
do
./cool --type $i
done
# for i in *.cl-type
# do
# echo "doin somehting"
# echo $i
# # rm `basename $i .cl-type`.cl-*
# done
for i in *.cl-lex
do
./cool --unlex $i
done
for i in *.cl2
do
mv $i `basename $i .cl2`.cl
done
zip automagic.zip [0-9]*.cl
