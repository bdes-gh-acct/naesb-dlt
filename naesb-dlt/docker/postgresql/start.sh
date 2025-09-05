#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE tsp;
    CREATE DATABASE price;
    CREATE DATABASE spire;
    CREATE DATABASE naesb;
    CREATE DATABASE tva;
    CREATE DATABASE eqt;
EOSQL