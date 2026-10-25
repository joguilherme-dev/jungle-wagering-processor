# Jungle Wagering Processor

A backend application built with NestJS and TypeScript as part of the Jungle Gaming backend technical challenge.

The project focuses on backend development concepts such as financial transaction processing, PostgreSQL persistence, message queues, and reliable event handling.

## Technologies

* Node.js
* TypeScript
* NestJS
* PostgreSQL 17
* TypeORM
* AWS SDK for JavaScript (SQS client)
* ElasticMQ for local SQS-compatible messaging
* Vitest
* Docker Compose

## Architecture Overview

The application includes components for:

* **Bets:** bet-related business operations.
* **Wallets:** wallet management and ledger entries.
* **Outbox:** persistence of events for reliable asynchronous processing.
* **Inbox:** tracking of consumed messages to help prevent duplicate processing.
* **SQS:** integration with an SQS-compatible messaging service.

The application uses PostgreSQL for persistence and ElasticMQ for local message-queue development.

## Prerequisites

Install the following tools before running the application:

* Node.js
* Bun
* Docker Desktop with Docker Compose

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Start the local infrastructure

Start PostgreSQL and ElasticMQ using Docker Compose:

```bash
docker compose up -d
```

The default PostgreSQL configuration is:

| Setting  | Value          |
| -------- | -------------- |
| Host     | `127.0.0.1`    |
| Port     | `5433`         |
| Database | `wagering`     |
| Username | `wagering`     |
| Password | `wagering_dev` |

These credentials are intended for local development only.

ElasticMQ is exposed on port `9324`, with its secondary interface on port `9325`.

### 3. Run database migrations

Apply the database migrations:

```bash
bun run migration:run
```

To revert the most recent migration:

```bash
bun run migration:revert
```

### 4. Start the application

Run the application in development mode:

```bash
bun run start:dev
```

To build the application:

```bash
bun run build
```

To run the compiled application:

```bash
bun run start:prod
```

## Testing

Run the automated test suite:

```bash
bun run test
```

Run tests in watch mode:

```bash
bun run test:watch
```

Run end-to-end tests:

```bash
bun run test:e2e
```

Generate test coverage:

```bash
bun run test:cov
```

## Configuration

The SQS client uses the following defaults for local development:

* Region: `us-east-1`
* Endpoint: `http://localhost:9324`
* Local access key: `local`
* Local secret key: `local`

The SQS endpoint can be overridden using the `SQS_ENDPOINT` environment variable.

The database connection is configured in `typeorm.config.ts`.

## Development Notes

* Database schema changes are managed through TypeORM migrations.
* Automatic schema synchronization is disabled.
* PostgreSQL data is persisted in a Docker volume.
* ElasticMQ provides a local SQS-compatible environment for development and testing.

## License

This project was developed as part of a technical hiring challenge. It is not intended for production use without further validation and configuration.
