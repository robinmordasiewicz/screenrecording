#!/bin/bash
#

TOKEN=`kubectl exec --namespace r-mordasiewicz -it svc/jenkins -c jenkins -- /bin/cat /run/secrets/chart-admin-password && echo`
docker run --name puppeteer --rm -t -v "$PWD":"/home/ubuntu" --workdir "/home/ubuntu" robinhoodis/puppeteer:latest bash -c "./puppeteer.sh $TOKEN"
