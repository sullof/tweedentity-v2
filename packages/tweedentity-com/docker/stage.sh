#!/usr/bin/env bash

docker stop qabra-app
docker rm qabra-app

docker stop qabra-app
docker rm qabra-app

source ../../.env.default && docker run -d \
  --name qabra-app \
  --link tweedentity-redis:redis \
  -p 6969 \
  -v $PWD:/usr/src/app \
  -v /vol/log/qabra_dapp:/var/log/qabra_dapp \
  -e VIRTUAL_HOST=qabra.com,www.qabra.com,app.qabra.com,dapp.qabra.com \
  -e LETSENCRYPT_HOST=qabra.com,www.qabra.com,app.qabra.com,dapp.qabra.com \
  -e LETSENCRYPT_EMAIL=admin@qabra.com \
  -w /usr/src/app node:erbium-alpine3.10 npm run start

#  -e INFURA_ID=$INFURA_ID \
#  -e ETHERSCAN_TWEEDENTITY_API_KEY=$ETHERSCAN_TWEEDENTITY_API_KEY \
