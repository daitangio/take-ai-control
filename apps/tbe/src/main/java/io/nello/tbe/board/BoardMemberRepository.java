package io.nello.tbe.board;

import io.nello.tbe.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BoardMemberRepository extends JpaRepository<BoardMember, BoardMember.BoardMemberId> {
    List<BoardMember> findByBoard(Board board);
    boolean existsByBoardAndUser(Board board, User user);
}
