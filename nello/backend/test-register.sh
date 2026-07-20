#!/bin/sh
for test_user in alfa beta gamma; do
    echo Creating test_user $test_user
    curl -L -i -X POST -H 'Content-Type: application/json' \
        -d '{ "email":"'${test_user}'@gioorgi.com", "password":"trustn00ne" }' http://localhost:6502/api/auth/register      
done        