# Munchcal Web

## PostgreSQL
This project requires a PostgreSQL database running. It requires the following table be created:

    create table users (
      id uuid,
      name text,
      email text,
      password text,
      date_created timestamp,
      date_modified timestamp
    );

## Config
Running this project requires environment variables to be set. Environment variables were chosen so that the source could remain public, whilst secret config could remain secret. You should obviously change them to values that make sense.

    export MUNCHCAL_PG_CONNECTION_STRING="postgres://username:password@localhost/database"
    export MUNCHCAL_SESSION_SECRET="keyboard cat"
    export MUNCHCAL_BCRYPT_WORK_FACTOR=10
    export MUNCHCAL_API_URL="http://localhost:10000"
    export MUNCHCAL_PARSER_URL="http://localhost:10010"

