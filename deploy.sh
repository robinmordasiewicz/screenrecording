#!/bin/bash
#

echo "deploy puppeteer container"

kubectl apply -f deployment.yaml --namespace r-mordasiewicz

echo "kubectl exec --namespace r-mordasiewicz -it puppeteer -c puppeteer -- /bin/bash"
