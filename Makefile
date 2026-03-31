.PHONY: up up-d down logs build restart ps clean

## Start all services and rebuild changed images
up:
	docker-compose up --build

## Start all services in the background (detached)
up-d:
	docker-compose up --build -d

## Stop all running services
down:
	docker-compose down

## Tail logs from all services (Ctrl+C to stop)
logs:
	docker-compose logs -f

## Rebuild images without starting
build:
	docker-compose build

## Show running container status
ps:
	docker-compose ps

## Full restart (down then up --build)
restart: down up

## Remove containers, volumes, and locally built images (clean slate)
clean:
	docker-compose down -v --rmi local
