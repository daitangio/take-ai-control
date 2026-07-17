package io.nello.tbe.board;

import io.nello.tbe.auth.User;
import io.nello.tbe.auth.UserService;
import io.nello.tbe.ws.BoardEvent;
import io.nello.tbe.ws.WebSocketBroadcaster;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepo;
    private final BoardMemberRepository memberRepo;
    private final UserService userService;
    private final WebSocketBroadcaster broadcaster;

    public List<Board> listForUser(String email) {
        User user = userService.getByEmail(email);
        return boardRepo.findAllForUser(user);
    }

    @Transactional
    public Board create(String name, String ownerEmail) {
        User owner = userService.getByEmail(ownerEmail);
        return boardRepo.save(Board.of(name, owner));
    }

    public Board get(String boardId, String email) {
        Board board = boardRepo.findById(boardId).orElseThrow();
        assertAccess(board, email);
        return board;
    }

    @Transactional
    public void share(String boardId, String ownerEmail, String inviteeEmail) {
        Board board = boardRepo.findById(boardId).orElseThrow();
        assertOwner(board, ownerEmail);
        User invitee = userService.findOrCreate(inviteeEmail);
        if (!memberRepo.existsByBoardAndUser(board, invitee)) {
            memberRepo.save(BoardMember.of(board, invitee));
            broadcaster.send(boardId, new BoardEvent("SHARED", "BOARD", boardId));
        }
    }

    @Transactional
    public void delete(String boardId, String ownerEmail) {
        Board board = boardRepo.findById(boardId).orElseThrow();
        assertOwner(board, ownerEmail);
        boardRepo.delete(board);
    }

    private void assertAccess(Board board, String email) {
        User user = userService.getByEmail(email);
        boolean isOwner = board.getOwner().getEmail().equals(email);
        boolean isMember = memberRepo.existsByBoardAndUser(board, user);
        if (!isOwner && !isMember) throw new AccessDeniedException("Not a board member");
    }

    private void assertOwner(Board board, String email) {
        if (!board.getOwner().getEmail().equals(email))
            throw new AccessDeniedException("Not the board owner");
    }
}
