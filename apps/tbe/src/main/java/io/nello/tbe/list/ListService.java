package io.nello.tbe.list;

import io.nello.tbe.board.Board;
import io.nello.tbe.board.BoardService;
import io.nello.tbe.ws.BoardEvent;
import io.nello.tbe.ws.WebSocketBroadcaster;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ListService {

    private final BoardListRepository listRepository;
    private final BoardService boardService;
    private final WebSocketBroadcaster broadcaster;

    @Transactional(readOnly = true)
    public List<BoardList> getLists(UUID boardId, String email) {
        boardService.getBoard(boardId, email); // access check
        return listRepository.findByBoardIdOrderByPosition(boardId);
    }

    @Transactional
    public BoardList createList(UUID boardId, String name, String email) {
        Board board = boardService.getBoard(boardId, email);
        int maxPos = listRepository.findMaxPosition(boardId);
        BoardList list = listRepository.save(new BoardList(board, name, maxPos + 1000));
        broadcaster.send(boardId, new BoardEvent("CREATED", "LIST", list));
        return list;
    }

    @Transactional
    public BoardList renameList(UUID boardId, UUID listId, String name, String email) {
        boardService.getBoard(boardId, email);
        BoardList list = listRepository.findByIdAndBoardId(listId, boardId)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("List not found"));
        list.setName(name);
        BoardList saved = listRepository.save(list);
        broadcaster.send(boardId, new BoardEvent("UPDATED", "LIST", saved));
        return saved;
    }

    @Transactional
    public void deleteList(UUID boardId, UUID listId, String email) {
        boardService.getBoard(boardId, email);
        BoardList list = listRepository.findByIdAndBoardId(listId, boardId)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("List not found"));
        listRepository.delete(list);
        broadcaster.send(boardId, new BoardEvent("DELETED", "LIST", Map.of("id", listId)));
    }

    @Transactional
    public BoardList moveList(UUID boardId, UUID listId, int newPosition, String email) {
        boardService.getBoard(boardId, email);
        BoardList list = listRepository.findByIdAndBoardId(listId, boardId)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("List not found"));
        list.setPosition(newPosition);
        BoardList saved = listRepository.save(list);
        broadcaster.send(boardId, new BoardEvent("MOVED", "LIST", saved));
        return saved;
    }
}
