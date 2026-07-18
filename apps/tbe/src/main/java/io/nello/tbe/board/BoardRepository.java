package io.nello.tbe.board;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface BoardRepository extends JpaRepository<Board, UUID> {

    @Query("""
        SELECT b FROM Board b
        WHERE b.owner.email = :email
           OR EXISTS (SELECT 1 FROM BoardMember m WHERE m.board = b AND m.user.email = :email)
        """)
    List<Board> findAccessibleBoards(@Param("email") String email);
}
