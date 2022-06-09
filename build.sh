#!/bin/bash
#

docker run --name puppeteer --rm -it -v "$PWD":"/home/ubuntu" --workdir "/home/ubuntu" robinhoodis/puppeteer:latest "./puppeteer.sh"
