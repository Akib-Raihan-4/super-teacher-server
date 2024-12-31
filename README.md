## Installation

Make sure you have `nvm` installed. Then, run the following commands:

```bash
$ nvm use
```

We use Node v20 by default.

```bash
$ yarn install
```
## Environment Variables
For local development and testing, please create the following files at the root of the project directory:

- `env.development.local`
- `env.test.local`

You can follow `env.example` to specify which env variables are needed for the project as a guideline, and the above two files can be created based off of this file.


## Conventions

Follow our [NestJS Conventions Doc](https://docs.google.com/document/d/1fBH7IJOy8ugQIxN64gHjv50Mn1cj2ZiqOYm4niP_WQU/edit) for guidelines

## Localstack

We depend on localstack for local development to test out our integration with the S3 object storage. To set it up, make sure that your machine has:

- [Docker](https://docs.docker.com/desktop/)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

Now, you have to configure an AWS profile. Run the following command and enter dummy values for access key id and secret:

```bash
aws configure --profile localstack_dev

AWS Access Key ID []: foo 
AWS Secret Access Key []: bar
Default region name []: us-east-1
Default output format []: json

```

Next, make sure your localstack instance is running via `docker compose`

```bash
docker compose -f ./docker-compose.localstack.yml up
```

Next, you need to create the S3 bucket
```bash
AWS_PROFILE=localstack_dev aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket project-dev-bucket
```

Verify that the bucket was created using:

```bash
AWS_PROFILE=localstack_dev aws --endpoint-url=http://localhost:4566 s3api list-buckets
```

You should see this output:

```
{
    "Buckets": [
        {
            "Name": "project-dev-bucket",
            "CreationDate": "2024-01-04T15:56:22+00:00"
        }
    ],
    "Owner": {
        "DisplayName": "webfile",
        "ID": "75aa57f09aa0c8caeab4f8c24e99d10f8e7faeebf76c078efc7c6caea54ba06a"
    }
}
```


## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

When using localstack, please explicitly set your `AWS_PROFILE` variable in your shell configuration file, or write all commands like the following:

```
AWS_PROFILE=localstack_dev yarn run start:dev 
```

## Database Migrations

```bash
# Drop all tables, run all migrations, seed the db with the specified seeder class in the script
$ yarn run db:migration:fresh:dev

# Drop all tables, run all migrations, doesn't seed the db
$ yarn run db:migration:fresh:test 

# Migrate up to latest
$ yarn run db:migration:up

# Migrate down by one
$ yarn run db:migration:down

# Create a new migration file (requires --name) (use --blank to skip autogeneration)
$ yarn run db:migration:create

# Seed database with dev variables and DatabaseSeeder
For seeding, we need to pass in the name of the seeder class. This is not supported by `yarn`, so we use `npm`
$ npm run db:seed:dev -- -c "DevDatabaseSeeder"

# Run all migrations and seeding with test variables
$ yarn run db:migration:test
```

## Commit Convention
``subject(ticket-code): message``

Valid subjects:
``build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test``

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```


<!-- README FOR DOCKER -->

# Run docker compose
docker-compose up -d

# Wait a few seconds for localstack to fully start
sleep 5
docker exec localstack-main awslocal s3 mb s3://project-dev-bucket

# Verify the bucket was created:
docker exec localstack-main awslocal s3 ls

# Check backend logs
docker logs superteacher_be -f