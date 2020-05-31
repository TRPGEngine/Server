#!/bin/bash

cd $(dirname $0)/kkFileView
echo $PWD

mkdir -p ./jodconverter-web/target/
wget -o ./jodconverter-web/target/kkFileView-2.2.0.tar.gz https://kkfileview.keking.cn/kkFileView-2.2.0.tar.gz
