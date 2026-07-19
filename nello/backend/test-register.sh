#!/bin/sh
for test_user in gio@gioorgi.com; do
    echo Creating test_user $test_user
    curl -L -i -X POST -H 'Content-Type: application/json' \
        -d '{ "email":"'${test_user}'", "password":"trustn00ne" }' http://localhost:6502/api/auth/register      
done        