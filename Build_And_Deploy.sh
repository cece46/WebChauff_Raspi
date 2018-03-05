#! /bin/bash

echo "Clean destination"
rm -r /tmp/bundle
rm -r /tmp/npm-*

rep=${PWD##*/}
echo "Build Projet $rep en cours ..."
/home/pi/meteor_universal/meteor build --directory /tmp

cd /tmp/bundle/programs/server/

echo "Installation NPM ..."
sudo npm install --unsafe-perm
sudo npm install -g n --unsafe-perm
sudo npm install bcrypt --unsafe-perm
sudo npm install fibers --unsafe-perm
sudo chown -R pi:pi /tmp/bundle

echo "Copie dans WWW"
sudo cp -r /tmp/bundle/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html/

echo “PM2 list process:”
pm2 list
echo "Restart"
pm2 restart $rep --update-env

