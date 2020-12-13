# SBERCLOUD. ADVANCED HACKING, 2020

```sh
echo "alias sber='kubectl --kubeconfig ~/.kube/config'" >> /.bash_aliases
source ~/.bash_aliases
```

# Notes

## Build images
```
docker build -t swr.ru-moscow-1.hc.sbercloud.ru/detsad/flask-kubernetes:v2 ./services/server/
docker build -t swr.ru-moscow-1.hc.sbercloud.ru/detsad/vue-kubernetes:v9 ./services/client/
docker push swr.ru-moscow-1.hc.sbercloud.ru/detsad/vue-kubernetes:v9
```


```sh
sber cluster-info
sber create -f ./kubernetes/postgres-deployment.yml 
sber create -f ./kubernetes/postgres-service.yml
sber apply -f ./kubernetes/flask-deployment.yml
sber create -f ./kubernetes/flask-service.yml
sber apply -f ./kubernetes/vue-deployment.yml

..etc
sber get pods

sber exec flask-fcb599d8b-kh4zt --stdin --tty -- python manage.py recreate_db
sber exec flask-fcb599d8b-kh4zt --stdin --tty -- python manage.py seed_db
```

## DB

```
sber exec postgres-5d6ff4dd69-5kmqs --stdin --tty -- createdb -U sample persons
sber exec postgres-5d6ff4dd69-5kmqs --stdin --tty -- psql -U sample
\c persons
\dt
select * from persons
```



## Check host

```
curl http://37.230.195.218/persons/ping
```



# Local dev

```sh
docker-compose up -d --build
docker-compose exec server python manage.py recreate_db
docker-compose exec server python manage.py seed_db
curl http://localhost:5000/persons/ping
```

# Credits:
https://testdriven.io/running-flask-on-kubernetes

