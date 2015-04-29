# Munchcal Web

## PostgreSQL
This project requires a PostgreSQL database running. It requires the following table be created:

    create table users (
      id uuid,
      name varchar(100),
      email varchar(100),
      password varchar(100),
      date_created timestamp,
      date_modified timestamp
    );

## Config
Running this project requires environment variables to be set. Environment variables were chosen so that the source could remain public, whilst secret config could remain secret. You should obviously change them to values that make sense.

    export MUNCHCAL_PG_CONNECTION_STRING="postgres://username:password@localhost/database"
    export MUNCHCAL_SESSION_SECRET="keyboard cat"
    export MUNCHCAL_BCRYPT_WORK_FACTOR=10

