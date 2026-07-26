-- Never insert alfa in board_,e,ber because he is the owner!
-- Otherwise alfa will lose abilityt to add members
insert into board_member(board_id,user_id)
select 'intro', id from user
where user!='alfa';