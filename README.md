# breadboard


## Dependencies

## taskmill-core-codedb
sudo apt install libssl-dev
sudo apt-get install libcurl3
sudo apt-get install libcurl4-openssl-dev


### Port forward
-- http://brianckelley.com/2015/02/simple-easy-nat-port-forwarding-for-iptables-ubuntu/
sudo vi /etc/sysctl.conf
#uncomment this line
net.ipv4.ip_forward=1

sudo iptables -t nat -A PREROUTING -i ens3 -p tcp --dport 80 -j REDIRECT --to-port 8040

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
