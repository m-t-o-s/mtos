#!/bin/bash

# Configuration

# This will be used in URLs and file paths, so don't get too fancy
# Alphanumeric characters and underscores should be ok
export APP_NAME=mtos

# IP or URL of the server you want to deploy to
export APP_HOST=mtos.co

# You usually don't need to change anything below this line

export SSH_HOST=papyromancer@lightcorp.net
export ROOT_URL=http://$APP_HOST
export APP_DIR=/home/papyromancer/production/$APP_NAME
export MONGO_URL=mongodb://localhost:27017/$APP_NAME
if [ -d ".meteor/meteorite" ]; then
    export METEOR_CMD=mrt
  else
    export METEOR_CMD=meteor
fi

case "$1" in
setup )
echo Preparing the server...
echo Get some coffee, this will take a while.
ssh $SSH_HOST APP_DIR=$APP_DIR 'bash -s' > /dev/null 2>&1 <<'ENDSSH'
ENDSSH
echo Done. You can now deploy your app.
;;
deploy )
echo Deploying...
$METEOR_CMD add appcache 
$METEOR_CMD bundle bundle.tgz 
$METEOR_CMD remove appcache 
scp bundle.tgz $SSH_HOST:/tmp/ 
rm bundle.tgz > /dev/null 2>&1 &&
ssh $SSH_HOST MONGO_URL=$MONGO_URL ROOT_URL=$ROOT_URL APP_DIR=$APP_DIR APP_NAME=$APP_NAME 'bash -s' <<'ENDSSH'
source $HOME/.nvm/nvm.sh
nvm use v0.8.22
if [ ! -d "$APP_DIR" ]; then
mkdir -p $APP_DIR
fi
pushd $APP_DIR
kill `cat $APP_NAME.pid`
rm -rf bundle
tar xfz /tmp/bundle.tgz -C $APP_DIR > /dev/null 2>&1
rm /tmp/bundle.tgz
PORT=3000 nohup "node" "bundle/main.js" 1>>"$APP_NAME.log" 2>"$APP_NAME.log" & echo $! > $APP_NAME.pid
popd
ENDSSH
echo Your app is deployed and serving on: $ROOT_URL
;;
* )
cat <<'ENDCAT'
./meteor.sh [action]

Available actions:

  setup   - Install a meteor environment on a fresh Ubuntu server
  deploy  - Deploy the app to the server
ENDCAT
;;
esac
