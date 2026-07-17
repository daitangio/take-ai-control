package io.nello.tbe.board;

import io.nello.tbe.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface BoardRepository extends JpaRepository<Board, String> {
    @Query("SELECT b FROM Board b WHERE b.owner = :user OR EXISTS (SELECT m FROM BoardMember m WHERE m.board = b AND m.user = :user)")
    List<Board> findAllForUser(User user);
}
