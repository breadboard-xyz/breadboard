rsa:
	ssh-keygen -f key
	ssh-keygen -f key.pub -e -m pem > key.pem

agent-jwt:
	node ../node_modules/jwtgen/bin/jwtgen.js -a RS256 -p ./key -c "iss=localhost" -c "sub=agent@localhost" -c "aud=make" -e 15552000 > ./agent.jwt

iptables-clear:
	# https://www.digitalocean.com/community/tutorials/how-to-list-and-delete-iptables-firewall-rules
	sudo iptables -P INPUT ACCEPT
	sudo iptables -P FORWARD ACCEPT
	sudo iptables -P OUTPUT ACCEPT

	sudo iptables -t nat -F
	sudo iptables -t mangle -F
	sudo iptables -F
	sudo iptables -X

# https://askubuntu.com/questions/444729/redirect-port-80-to-8080-and-make-it-work-on-local-machine
iptables-config:
	iptables -t nat -A PREROUTING -i ens3 -p tcp --dport 80 -j REDIRECT --to-ports 8040
	iptables -t nat -A OUTPUT -o lo -p tcp --dport 80 -j REDIRECT --to-port 8040

iptables-list:
	iptables -L -n -t nat

docker-restart:
	sudo service docker restart
