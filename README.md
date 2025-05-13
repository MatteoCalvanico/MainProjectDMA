# MainProjectDMA
Main project made in DMA for my internship

## Start-up
This project uses Docker Compose to simplify the compilation. Some confidential variables are taken from a .env file that you need to create (name it *compose-var.env* and place it in the root folder), here is the template:
```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY----------END PRIVATE KEY-----\n
FIREBASE_PUBLIC_KEY=-----BEGIN CERTIFICATE----------END CERTIFICATE-----\n
FIREBASE_API=
```
Now you can start all the service with:

```sh
docker compose --env-file ./compose-var.env up --build
```

## Context
Evolution of [Toy Project](https://github.com/MatteoCalvanico/ProgettoGiocattoloDMA). 
The main differences are:
- **Firebase Auth integration**: now the users need to be logged/registered to use the services because all the route are protected.
- **More microservices**: the back-end is now more divided; all microservices are atomic, agnostic, isolated and protected.
- **Using AMQP**: in addition to MQTT, which is used to send messages to RabbitMQ, AMQP is used to receive messages from it.

## Technology used
The new tech used (in addition to the previous ones):
- [amqp-node](https://github.com/amqp-node/amqplib)
- [Firebase Auth](https://console.firebase.google.com/project/dma-internship-project/authentication/users)
- [JWT Kong Plugin](https://docs.konghq.com/hub/kong-inc/jwt/)

## Schema
Project architecture with all microservices and networks:
![Project](./images/img.png)