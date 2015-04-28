# Munchcal Web

## Config
Running this project requires environment variables to be set. Environment variables were chosen so that the source could remain public, whilst secret config could remain secret. You should obviously change them to values that make sense.

    export MUNCHCAL_PG_CONNECTION_STRING="postgres://username:password@localhost/database"
    export MUNCHCAL_SESSION_SECRET="keyboard cat"
    export MUNCHCAL_BCRYPT_WORK_FACTOR=10

