-- Ensure intro board is on everyone
-- Select all user with board user and exclue them
PRAGMA foreign_keys=ON;
begin transaction;

-- collect candidate in temp table
create table tempx (id text);
insert into tempx(id)
    select id from user
    except
    select distinct user_id from board where id like 'intro%';    

.print Demo board to create
select * from tempx;

insert into board(id,user_id,name)
select 'intro-' || id, id, 'Nello IntroCopy'
from tempx;

-- Now take the list and dup them
insert into list(id,board_id,name, position, created_at)
select tempx.id || '-' || list.id  ,'intro-' || tempx.id,name, position, created_at 
    from list, tempx
where board_id='intro';

-- Now dup the cards
insert into card(id,list_id,title,description, position, created_at)
select tempx.id || '-'|| card.id,list_id,title,description, position, created_at
 from card, tempx
where list_id in (select id from list where board_id like 'intro-%');

.print Status
select id from user
except
select distinct user_id from board where id like 'intro-%';

drop table tempx;
--rollback;
COMMIT;