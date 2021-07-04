#!/usr/bin/env bash

source docker/.default.env && docker run -it --rm \
  --name tweedentity-app-dev \
  --link tweedentity-redis:redis \
  -p 6969:6969 \
  -v $PWD:/usr/src/app \
  -v $PWD/log:/var/log/tweedentity_app \
  -e VIRTUAL_HOST=felice0 \
  -w /usr/src/app node:6 npm test

