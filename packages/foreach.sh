#!/bin/bash
#set -e

cd `dirname $0`
dirs=$(ls -l | awk '/^d/ {print $NF}')

for dir in $dirs
do
  echo '开始处理:\t'$dir
  (
    cd $dir
    if [[ ! -n $1 ]]; then
      git pull
    else
      $1
    fi
  )
done

echo "命令 "$1" 执行完毕"
