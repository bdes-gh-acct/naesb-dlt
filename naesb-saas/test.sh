#!/bin/bash

DB_SECRET=$(aws secretsmanager get-secret-value --region us-east-1 --secret-id arn:aws:secretsmanager:us-east-1:094458522773:secret:naesb-pg-EDyiXl --query SecretString --output text)
DB_USERNAME=$($DB_SECRET | jq -r ".username")
DB_PASSWORD=$($DB_SECRET | jq -r ".password")