#!/bin/bash
ls db-init
for s in db-init/*.sql; do 
    echo -n $s ...
    sqlite3 -batch -init $s ./nello.db .quit
    echo ok
done    