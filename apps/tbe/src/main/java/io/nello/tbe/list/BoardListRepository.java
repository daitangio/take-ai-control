package io.nello.tbe.list;

import io.nello.tbe.board.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BoardListRepository extends JpaRepository<BoardList, String> {
    List<BoardList> findByBoardOrderByPosition(Board board);
    int countByBoard(Board board);
}
