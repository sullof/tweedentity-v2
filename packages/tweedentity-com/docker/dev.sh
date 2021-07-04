#!/usr/bin/env bash

source ../../.env.default && docker run -it --rm \
  --name tweedentity-app-dev \
  -p 6969 \
  -v $PWD:/usr/src/app \
  -v $PWD/log:/var/log/tweedentity_dapp \
  -e NODE_ENV=development \
  -e VIRTUAL_HOST=tweedentity.com.localhost,www.tweedentity.com.localhost,app.tweedentity.com.localhost,dapp.tweedentity.com.localhost \
  -w /usr/src/app node:erbium-alpine3.10 npm run start

#  --link tweedentity-redis:redis \
#  -e INFURA_ID=$INFURA_ID \
#  -e ETHERSCAN_TWEEDENTITY_API_KEY=$ETHERSCAN_TWEEDENTITY_API_KEY \
