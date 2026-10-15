#!/bin/bash

set -euo pipefail

nextId(){
    sqlite3 -batch  ./nello.db 'select format("%-03.0i",coalesce(max(id)+1,1)) from stone_base ;'
}

## Execute the first migrator 
sqlite3 -batch -init ./db-init/000-stone-base.sql ./nello.db .quit
startId=$(nextId)
fileId="$startId"

while true; do

    fileName=(./db-init/${fileId}-*.sql)
    
    if [ -f $fileName ]; then
        #echo "$fileId - $fileName"        
        sqlite3 -batch -init $fileName ./nello.db .quit
        ## RECORD AUTOMATICALLY THE EXECUTION
        checksum=$(md5sum --tag "$fileName"  | cut -d "=" -f 2)
        sqlite3 -batch nello.db \
            "insert into stone_base(id,file,md5) select $fileId,'$fileName', '$checksum' ;"        

    else
        echo "Migration complete"
        sqlite3 -table -batch nello.db "select * from stone_base where id >= $startId order by 1;"
        exit
    fi
    fileId=$(nextId)
done


# for s in db-init/*.sql; do 
#     echo -n $s ...
#     sqlite3 -batch -init $s ./nello.db .quit
#     echo ok
# done    