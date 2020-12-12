# Running Flask on Kubernetes

```sh
echo "alias sber='kubectl --kubeconfig ~/.kube/config'" >> /.bash_aliases
source ~/.bash_aliases
```

# Notes


```sh
sber create -f ./kubernetes/postgres-deployment.yml 
sber create -f ./kubernetes/postgres-service.yml
sber create -f ./kubernetes/flask-deployment.yml
sber create -f ./kubernetes/flask-service.yml

..etc
sber get pods

sber exec flask-fcb599d8b-kh4zt --stdin --tty -- python manage.py recreate_db
sber exec flask-fcb599d8b-kh4zt --stdin --tty -- python manage.py seed_db
```

# Credits:
https://testdriven.io/running-flask-on-kubernetes