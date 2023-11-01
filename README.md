# node-prisma-rest-api

Core API as a Portafolio for REST API with Serverless

- [Serverless Framework (AWS)](https://www.serverless.com/framework/docs/providers/aws/)
- [Node.js](https://nodejs.org/)/[Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)

## Rules

Each commit must be signed from a verified user using GPG. Please read the documentation on managing commit signature verification. You can find that [here](https://docs.github.com/en/github/authenticating-to-github/managing-commit-signature-verification).


#### Install dependencies

For you to start using this backend project you must do the following:

1. Run `yarn` in `/libs` directory to install all the libs dependencies
2. Configure a `/env` in `/libs` and setup `DATBASE_URL` with your mongodb cluster
3. Run `yarn deploy-db` to sync your Prisma Schema wioth mongodb
4. Run `yarn set-up` on each service on the root of `/services` directory