#!/usr/bin/env bash

tag="$1"

docker build -t vincentjorgensen/node-helloworld:"$tag" .
docker push vincentjorgensen/node-helloworld:"$tag"
