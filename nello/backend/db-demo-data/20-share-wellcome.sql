-- Never insert alfa in board_,e,ber because he is the owner!
-- Otherwise alfa will lose abilityt to add members
-- It is not woring
insert into board_member(board_id,user_id)
select 'intro', id from user where id!='alfa';