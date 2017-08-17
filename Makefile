# Determine this makefile's path.
# Be sure to place this BEFORE `include` directives, if any.
THIS_FILE := $(lastword $(MAKEFILE_LIST))

deploy:
	@$(MAKE) -f $(THIS_FILE) install
	@$(MAKE) -f $(THIS_FILE) start

install:
	rm -r node_modules/ || true
	npm i
	
start:
	pm2 flush || true
	pm2 delete all || true
	rm -rf ~/.pm2/logs/* || true
	pm2 start breadboard.json
	
stop:
	pm2 delete all

