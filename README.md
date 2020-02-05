## Deployment steps

Adapted from : [How To Deploy MERN (Mongo Express React Node) Stack App on AWS EC2— THE RIGHT WAY! by Ryan Smith](https://medium.com/@rksmith369/how-to-deploy-mern-stack-app-on-aws-ec2-with-ssl-nginx-the-right-way-e76c1a8cd6c6)

### Create aws/ec2 instance:

- Enter AWS, and click launch new instance.
- Select Ubuntu 16.04 LTS
- Select t2.micro \*\* Note: Do not "Review and launch" after this step. Click " Next: Configure Instance Details"
- Set security settings:
- Add http and https set them to:
- ssh 0.0.0.0, (Anywhere or myIP)
- http 0.0.0.0 (Anywhere)
- https 0.0.0.0 (Anywhere, or don't set it)
- Download a .pem key from AWS or use an existing key

### Connecting to your instance

- Right click your newly created instance and click “connect”
- Open git bash(windows) or terminal(mac) and cd into the directory you saved the particular pemkey for that instance,
- Follow the steps on window that pops up after clicking connect

- Type into terminal
  `chmod 400 {{PemKeyName.pem}}`
- ssh to Ubuntu server:
  `copy the ssh-link right under example:`

- After connecting, type in terminal/gitbash:

```
yes

sudo apt-get update

sudo apt-get install -y build-essential openssl libssl-dev pkg-config
```

### Node.js Setup

Install Node.js onto the server

```
sudo apt-get install -y build-essential openssl libssl-dev pkg-config

sudo apt-get install -y nodejs nodejs-legacy

sudo apt-get install npm -y

sudo npm cache clean -f

sudo npm install -g n

sudo n stable

sudo apt-get install nginx git -y
```

### Transfer file to /var/www

```
cd /var/www

Transfer the gold-central-master file to this directory
```

### SetUp Nginx:

```
sudo apt-get install -y build-essential openssl libssl-dev pkg-config

cd /etc/nginx/sites-available

sudo vim gold-central-master
```

Add the following code to the file you just made by using vim. Enter insert mode by typing "i". Change the two placeholders inside of double curly brackets {{ }} to match your specifications.

```
server {
    listen 80;
    location / {
        proxy_pass http://{{PRIVATE IP FROM EC2 INSTANCE}}:3900;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**hit:** esc

**type:** :wq

**hit:** enter key

### Remove the default from nginx’s sites-available directory:

`sudo rm default`

### Create a symbolic link from sites-enabled to sites-available:

`sudo ln -s /etc/nginx/sites-available/gold-central-master/etc/nginx/sites-enabled/gold-central-master`

### Remove the default from nginx’s sites-enabled diretory:

```
sudo rm /etc/nginx/sites-enabled/default

**Installing pm2 and updating project dependencies:**

sudo npm install pm2 -g

cd /var/www/

sudo chown -R ubuntu gold-central-master

cd gold-central-master

sudo npm install
```

### then

```
cd frontend

sudo npm install

sudo npm run build
```

### Install MongoDB

Paste into terminal

```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list
```

### then

```
sudo apt install udo
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### Create data/db:

```
sudo mkdir /data
sudo mkdir /data/db
sudo service mongod start
```

### Check the status of your service. Use ctrl C when you are done:

`sudo service mongod status`

### Automatically start Mongo when the system starts:

```
sudo systemctl enable mongod && sudo systemctl start mongod
cd /var/www/gold-central-master
```

### Start your pm2 project at root directory::

`pm2 start app.js`

### `ps -ef`

Allows you to see all the background processes that are running.

### `kill (process ID)`

Stop the background process from running.

## Setting up environmental variables

export jwtPrivateKey=[yourprivatekey]

export systemEmail=[yoursystememail]

export password=[yoursystememailpassword]

export adminEmail=[youradminemail]

export sqlHost=[yourgscdbhost]

export sqlUser=[yourgscdbuser]

export sqlPassword=[yourgscdbpassword]

export sqlDb=[yourgscdb]

### Restart nginx:

`sudo service nginx stop && sudo service nginx start`

### Go back to your EC2 Instance, at the bottom window of information for said selected instance, copy the PUBLIC IP ADDRESS, and paste it into your browser.
