package io.nello.tbe.list;

import io.nello.tbe.board.Board;
import io.nello.tbe.board.BoardService;
import io.nello.tbe.ws.BoardEvent;
import io.nello.tbe.ws.WebSocketBroadcaster;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ListService {

    private final BoardListRepository repo;
    private final BoardService boardService;
    private final WebSocketBroadcaster broadcaster;

    public List<BoardList> getListsForBoard(String boardId, String email) {
        Board board = boardService.get(boardId, email);
        return repo.findByBoardOrderByPosition(board);
    }

    @Transactional
    public BoardList create(String boardId, String name, String email) {
        Board board = boardService.get(boardId, email);
        int maxPos = repo.findByBoardOrderByPosition(board).stream()
            .mapToInt(BoardList::getPosition).max().orElse(0);
        BoardList list = repo.save(BoardList.of(board, name, maxPos + 1000));
        broadcaster.send(boardId, new BoardEvent("CREATED", "LIST", list));
        return list;
    }

    @Transactional
    public BoardList rename(String listId, String name, String email) {
        BoardList list = repo.findById(listId).orElseThrow();
        boardService.get(list.getBoard().getId(), email);
        list.setName(name);
        BoardList saved = repo.save(list);
        broadcaster.send(list.getBoard().getId(), new BoardEvent("UPDATED", "LIST", saved));
        return saved;
    }

    @Transactional
    public void delete(String listId, String email) {
        BoardList list = repo.findById(listId).orElseThrow();
        String boardId = list.getBoard().getId();
        boardService.get(boardId, email);
        repo.delete(list);
        broadcaster.send(boardId, new BoardEvent("DELETED", "LIST", listId));
    }
}
