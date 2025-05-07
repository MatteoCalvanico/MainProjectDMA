#!/bin/bash

echo "Waiting for Kong to start..."
until curl -s http://kong:8001/; do
  sleep 2
done
echo "Setting up RabbitMQ WebSocket Service in Kong..."

# Delete routes and services for a fresh start
echo "Removing any existing routes..."
curl -s -X DELETE http://kong:8001/routes/rabbitmq-ws-route
curl -s -X DELETE http://kong:8001/routes/auth
curl -s -X DELETE http://kong:8001/routes/retrive
curl -s -X DELETE http://kong:8001/routes/user
curl -s -X DELETE http://kong:8001/routes/auth-login-route
curl -s -X DELETE http://kong:8001/routes/auth-register-route
curl -s -X DELETE http://kong:8001/routes/auth-verify-route
curl -s -X DELETE http://kong:8001/routes/auth-protected-route
curl -s -X DELETE http://kong:8001/routes/retrive-verify-route
curl -s -X DELETE http://kong:8001/routes/retrive-protected-route
curl -s -X DELETE http://kong:8001/routes/user-verify-route
curl -s -X DELETE http://kong:8001/routes/user-protected-route
sleep 1
echo "Removing any existing services..."
curl -s -X DELETE http://kong:8001/services/rabbitmq-ws
curl -s -X DELETE http://kong:8001/services/auth
curl -s -X DELETE http://kong:8001/services/retrive
sleep 1


## INIT JWT Plugin config
echo "Setting up JWT authentication with Firebase custom tokens..."
# Add the JWT plugin for Kong to verify Firebase custom tokens
## With 'claims_to_verify=exp' identifies the expiration time on or after which the JWT must not be accepted for processing
curl -X PATCH http://kong:8001/plugins \
  --data "name=jwt" \
  --data "config.claims_to_verify=exp" \
  --data "config.secret_is_base64=false" \
  --data "config.key_claim_name=iss" \
  --data "config.maximum_expiration=3600" \
  --data "config.header_names = authorization"

# Consumer for Firebase-generated tokens
curl -X POST http://kong:8001/consumers/ \
  --data "username=firebase-auth"

# Add a JWT credential
echo "Configuring consumer for Firebase project"
curl -X POST http://kong:8001/consumers/firebase-auth/jwt \
  --data "algorithm=RS256" \
  --data "secret=$FIREBASE_PRIVATE_KEY" \
  --data "key=$ISSUER" \
  --data-urlencode "rsa_public_key=$(cat /tmp/public_key.pem)"
## FINISH JWT Plugin config


## INIT RabbitMQ config
# Create a service for RabbitMQ WebSocket
echo "Creating RabbitMQ WebSocket service..."
curl -i -X POST http://kong:8001/services \
  --data name=rabbitmq-ws \
  --data url=http://rabbitmq:15675/ws

# Add a route with proper WebSocket configuration
echo "Creating route to the service..."
curl -i -X POST http://kong:8001/services/rabbitmq-ws/routes \
  --data "paths[]=/mqtt-ws" \
  --data "protocols[]=http" \
  --data "protocols[]=https" \
  --data name=rabbitmq-ws-route

# Protect MQTT WebSocket route with JWT authentication
echo "Protecting MQTT WebSocket route with JWT authentication..."
curl -X POST http://kong:8001/services/rabbitmq-ws/plugins \
  --data "name=jwt"
## FINISH RabbitMQ config


## INIT Back-end Endpoints config
# Create a services for back-end endpoints
echo "Creating endpoints service..."
# Auth endopoints
echo "...for auth-service"
curl -i -X POST http://kong:8001/services \
  --data name=auth \
  --data url=http://auth:8080
# Retrive endopoints
echo "...for retrive-service"
curl -i -X POST http://kong:8001/services \
  --data name=retrive \
  --data url=http://retrive:8090
# User endopoints
echo "...for user-service"
curl -i -X POST http://kong:8001/services \
  --data name=user \
  --data url=http://user:8100


# Add routes
echo "Creating routes to the services..."
echo "...for auth-service"
# Create unprotected routes for authentication endpoints
echo "Creating unprotected routes for login, register and verify..."
curl -i -X POST http://kong:8001/services/auth/routes \
  --data "paths[]=/auth/verify" \
  --data "protocols[]=http" \
  --data "protocols[]=https" \
  --data "strip_path=false" \
  --data "name=auth-verify-route"
curl -i -X POST http://kong:8001/services/auth/routes \
  --data "paths[]=/auth/login" \
  --data "protocols[]=http" \
  --data "protocols[]=https" \
  --data "strip_path=false" \
  --data "name=auth-login-route"
curl -i -X POST http://kong:8001/services/auth/routes \
  --data "paths[]=/auth/register" \
  --data "protocols[]=http" \
  --data "protocols[]=https" \
  --data "strip_path=false" \
  --data "name=auth-register-route"
# Create a route for all other auth endpoints
echo "Creating protected routes for all other auth endpoints..."
curl -i -X POST http://kong:8001/services/auth/routes \
  --data "paths[]=/auth" \
  --data "protocols[]=http" \
  --data "protocols[]=https" \
  --data "name=auth-protected-route"

echo "...for retrive-service"
# Create unprotected routes for retrive endpoints
echo "Creating unprotected routes for verify..."
curl -i -X POST http://kong:8001/services/retrive/routes \
  --data "paths[]=/retrive/verify" \
  --data "protocols[]=http" \
  --data "protocols[]=https" \
  --data "strip_path=false" \
  --data "name=retrive-verify-route"
# Create a route for all other auth endpoints
echo "Creating protected routes for all other retrive endpoints..."
curl -i -X POST http://kong:8001/services/retrive/routes \
  --data "paths[]=/retrive" \
  --data "protocols[]=http" \
  --data "protocols[]=https" \
  --data "name=retrive-protected-route"

echo "...for user-service"
# Create unprotected routes for authentication endpoints
echo "Creating unprotected routes verify..."
curl -i -X POST http://kong:8001/services/user/routes \
  --data "paths[]=/user/verify" \
  --data "protocols[]=http" \
  --data "protocols[]=https" \
  --data "strip_path=false" \
  --data "name=user-verify-route"
# Create a route for all other auth endpoints
echo "Creating protected routes for all other user endpoints..."
curl -i -X POST http://kong:8001/services/user/routes \
  --data "paths[]=/user" \
  --data "protocols[]=http" \
  --data "protocols[]=https" \
  --data "name=user-protected-route"


# Apply JWT plugin only to the protected route
echo "Protecting auth routes with JWT authentication..."
curl -X POST http://kong:8001/routes/auth-protected-route/plugins \
  --data "name=jwt"
echo "Protecting retrive routes with JWT authentication..."
curl -X POST http://kong:8001/routes/retrive-protected-route/plugins \
  --data "name=jwt" \
  --data "config.run_on_preflight=false"
echo "Protecting user routes with JWT authentication..."
curl -X POST http://kong:8001/routes/user-protected-route/plugins \
  --data "name=jwt" \
  --data "config.run_on_preflight=false"
## FINISH Back-end Endpoints config


echo "Kong configuration completed!"