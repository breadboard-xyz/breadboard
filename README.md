# breadboard


## Dependencies

## taskmill-core-codedb
sudo apt install libssl-dev
sudo apt-get install libcurl3
sudo apt-get install libcurl4-openssl-dev


### Port forward
-- see `./data/Makefile`

### Install CERT CHAIN
https://askubuntu.com/questions/73287/how-do-i-install-a-root-certificate
https://www.cyberciti.biz/faq/test-ssl-certificates-diagnosis-ssl-certificate/

```
 "name"       : "account",
 "script"      : "./node_modules/taskmill-core-account/index.js",
 "env"        : {
    "NODE_EXTRA_CA_CERTS" : "/usr/share/ca-certificates/abc.crt"
 }
```

### nodegit setup issues
#### MacOS
https://github.com/JustinTulloss/zeromq.node/issues/283

#### Ubuntu
https://www.digitalocean.com/community/questions/install-zeromq-on-ubunto-14-04-4-x64
