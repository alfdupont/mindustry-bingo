#!/bin/bash

docker run \
    -d \
    --rm \
    -p 8888:80 \
    --name mindustry_bingo \
    mindustry_bingo:latest