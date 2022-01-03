.DEFAULT_GOAL := help
SHELL := /bin/bash
USER := govflow
NAME := govflow
VERSION := 0.0.24-alpha
COMPOSE := docker-compose -f docker-compose/docker-compose.yml --compatibility
REPOSITORY := $(USER)/$(NAME)
DOCKER_HOST := ghcr.io
DOCKER_VERSION := $(VERSION)

####

.PHONY: help
help:
	@echo "Use \`make <target>' where <target> is one of"
	@grep -E '^\.PHONY: [a-zA-Z_-]+ .*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = "(: |##)"}; {printf "\033[36m%-30s\033[0m %s\n", $$2, $$3}'

####
.PHONY: install ## Install dependencies.
install:
	npm cache clean --force
	npm install

.PHONY: lint ## Lint code.
lint:
	npx eslint --no-error-on-unmatched-pattern src/** test/**

.PHONY: test ## Test code with coverage.
test:
	CAPTCHA_ENABLED='0' npm run test

####

.PHONY: serve ## Serve the default application.
serve:
	npm start

.PHONY: migrate ## Run database migrations.
migrate:
	npm run migrate up

.PHONY: fake-data ## Populate an empty govflow database with fake data.
fake-data:
	npm run generate-fake-data

.PHONY: send-email ## Send an email with the email backend (for testing).
send-email:
	npm run send-test-email

.PHONY: send-sms ## Send an sms with the sms backend (for testing).
send-sms:
	npm run send-test-sms

.PHONY: send-dispatch ## Send an email or sms with the higher-level dispatch function (for testing).
send-dispatch:
	npm run send-test-dispatch

####

.PHONY: tag-release ## Create a git tag for release and push to origin.
tag-release:
	git tag -a $(VERSION) -m "version $(VERSION)"
	git push --follow-tags

.PHONY: prepublish ## Build package distribution.
prepublish:
	rm -rf lib
	npm run build
	cp package*.json lib
	cp LICENSE lib
	cp README.md lib
	cp -r src/core/communications/templates lib/core/communications/templates
	chmod -R +x lib/cli/*.js

.PHONY: publish ## Publish the package to npm.
publish:
	cd lib && npm publish --access public

####

.PHONY: dropdb ## Drop the app database.
dropdb:
	dropdb $(NAME) --if-exists

.PHONY: createdb ## Create the app database.
createdb:
	createdb $(NAME)

.PHONY: initdb ## Init the app database.
initdb: dropdb createdb

####

.PHONY: docker-build ## Build Docker image from project.
docker-build:
	docker build --tag $(USER)/$(NAME) --rm=false .

.PHONY: docker-tag ## Tag Docker image for push to repository.
docker-tag:
	docker tag $(USER)/$(NAME) $(DOCKER_HOST)/$(USER)/$(NAME):$(DOCKER_VERSION)

.PHONY: docker-push ## Publish the Dockerfile to a package repository.
docker-push:
	docker push $(DOCKER_HOST)/$(USER)/$(NAME):$(DOCKER_VERSION)

.PHONY: docker-run ## Run the latest Docker image.
docker-run:
	docker run $(USER)/$(NAME)

.PHONY: docker-shell ## Get a shell in the latest Docker image.
docker-shell:
	docker run -it $(USER)/$(NAME) /bin/bash

####

.PHONY: compose-pull ## Pull all images in the Docker Compose configuration.
compose-pull:
	$(COMPOSE) pull

.PHONY: compose-up ## Run the Docker Compose configuration.
compose-up:
	$(COMPOSE) up --remove-orphans

.PHONY: compose-up-detach ## Run the Docker Compose configuration, detached.
compose-up-detach:
	$(COMPOSE) up --remove-orphans --detach

.PHONY: compose-down ## Stop the Docker Compose configuration.
compose-down:
	$(COMPOSE) down --remove-orphans

.PHONY: compose-config ## Show the evaluated compose configuration.
compose-config:
	$(COMPOSE) config

.PHONY: compose-logs ## Show logs from running containers
compose-logs:
	$(COMPOSE) logs

.PHONY: compose-reload ## Reload from new docker compose config.
compose-reload: down up-detach
