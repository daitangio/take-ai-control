#!/bin/sh
# Like Kate Perry California Gurl but better
# Backup nello database mounted under /app/nello/nello.db
# Do a backup every 5 minutes
# Rotate backup every week-day, to have up to 7 backups
INTERVAL_MINUTES=45


while true; do
    BACKUP_FILE=nello-backup-$(date +%w).sql
    echo -n $BACKUP_FILE .
    sqlite3  /app/nello/nello.db .dump >/app/nello/$BACKUP_FILE
    echo -n .
    
    # Apply also the monthly backup, copying this one (less impact)
    BACKUP_FILE_MONTHLY=nello-monthly-backup-$(date +%m).sql
    cp /app/nello/$BACKUP_FILE /app/nello/$BACKUP_FILE_MONTHLY

    echo ..DONE
    sleep $(( $INTERVAL_MINUTES*60))
    

done    

