#!/bin/sh

yarn db:migration:up:dev
# awslocal s3 mb s3://project_dev
yarn start:dev

