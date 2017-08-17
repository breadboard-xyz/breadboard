rsa:
	ssh-keygen -f key
	ssh-keygen -f keyssh-keygen -f key

agent-jwt:
	node ../node_modules/jwtgen/bin/jwtgen.js -a RS256 -p ./key -c "iss=localhost" -c "sub=agent@localhost" -c "aud=make" -e 2592000 > ./agent.jwt

