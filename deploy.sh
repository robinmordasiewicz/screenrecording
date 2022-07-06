#!/bin/bash
#

echo "deploy screenrecording container"

kubectl apply -f deployment.yaml --namespace r-mordasiewicz

echo "kubectl exec --namespace r-mordasiewicz -it screenrecording -c screenrecording -- /bin/bash"
