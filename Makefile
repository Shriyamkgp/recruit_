build:
	docker-compose up --build

build-no-cache:
	docker-compose build --progress=plain --no-cache

up:
	docker-compose up

down:
	docker-compose down

logs:
	docker-compose logs -f