package io.nello.tbe.list;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BoardListRepository extends JpaRepository<BoardList, UUID> {
    List<BoardList> findByBoardIdOrderByPosition(UUID boardId);

    @Query("SELECT COALESCE(MAX(l.position), 0) FROM BoardList l WHERE l.board.id = :boardId")
    int findMaxPosition(@Param("boardId") UUID boardId);

    Optional<BoardList> findByIdAndBoardId(UUID id, UUID boardId);
}
