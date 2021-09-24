# RESTFul API for the CognoHub Application

[![Build Status](https://travis-ci.com/cognohub/cognohub-api.svg?token=NDv6yhT4Z8qoTzehcF9x&branch=main)](https://travis-ci.com/cognohub/cognohub-api)

Introduction: WIP

## Manual Installation

Clone the repo:

```bash
git clone https://github.com/cognohub/cognohub-api.git
cd cognohub-api
```

Install the dependencies:

```bash
yarn install
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables (You can reach out to Olaoluwa if you need any specific variable information)
```

## Commands

Running locally:

```bash
yarn dev
```

Running in production:

```bash
yarn start
```

Testing:

```bash
# run all tests
yarn test

# run all tests in watch mode
yarn test:watch

# run test coverage
yarn coverage
```

Docker:

```bash
# run docker container in development mode
yarn docker:dev

# run docker container in production mode
yarn docker:prod

# run all tests in a docker container
yarn docker:test
```

Linting:

```bash
# run ESLint
yarn lint

# fix ESLint errors
yarn lint:fix

# run prettier
yarn prettier

# fix prettier errors
yarn prettier:fix
```
## API Documentation

To view the list of available APIs and their specifications, run the server and go to `http://localhost:${PORT}/v1/docs` in your browser. This documentation page is automatically generated using the [swagger](https://swagger.io/) definitions written as comments in the route files.

### API Endpoints

List of available routes: This will be referenced to the public swagger or postman docs later.

