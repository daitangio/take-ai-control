package io.nello.tbe.board;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BoardMemberRepository extends JpaRepository<BoardMember, BoardMember.Id> {
    List<BoardMember> findByBoardId(UUID boardId);
    boolean existsByBoardIdAndUserId(UUID boardId, UUID userId);
    void deleteByBoardIdAndUserId(UUID boardId, UUID userId);
}
