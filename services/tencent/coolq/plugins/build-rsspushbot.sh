#!/bin/bash

cd ./coolq-rsspushbot

docker run --rm -v $PWD:/home tnze/coolq-golang-builder
