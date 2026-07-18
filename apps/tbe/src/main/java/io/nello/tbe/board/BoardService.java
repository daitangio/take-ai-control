package io.nello.tbe.board;

import io.nello.tbe.auth.User;
import io.nello.tbe.auth.UserRepository;
import io.nello.tbe.auth.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final BoardMemberRepository boardMemberRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<Board> listBoards(String email) {
        return boardRepository.findAccessibleBoards(email);
    }

    @Transactional
    public Board createBoard(String name, String ownerEmail) {
        User owner = userService.findOrCreate(ownerEmail);
        return boardRepository.save(new Board(name, owner));
    }

    @Transactional(readOnly = true)
    public Board getBoard(UUID boardId, String email) {
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Board not found"));
        assertAccess(board, email);
        return board;
    }

    @Transactional
    public Board renameBoard(UUID boardId, String name, String email) {
        Board board = getBoard(boardId, email);
        board.setName(name);
        return boardRepository.save(board);
    }

    @Transactional
    public void deleteBoard(UUID boardId, String email) {
        Board board = getBoard(boardId, email);
        assertOwner(board, email);
        boardRepository.delete(board);
    }

    @Transactional
    public void addMember(UUID boardId, String memberEmail, String requesterEmail) {
        Board board = getBoard(boardId, requesterEmail);
        assertOwner(board, requesterEmail);
        User member = userService.findOrCreate(memberEmail);
        if (!boardMemberRepository.existsByBoardIdAndUserId(boardId, member.getId())) {
            boardMemberRepository.save(new BoardMember(board, member));
        }
    }

    @Transactional
    public void removeMember(UUID boardId, String memberEmail, String requesterEmail) {
        Board board = getBoard(boardId, requesterEmail);
        assertOwner(board, requesterEmail);
        userRepository.findByEmail(memberEmail).ifPresent(member ->
            boardMemberRepository.deleteByBoardIdAndUserId(boardId, member.getId()));
    }

    private void assertAccess(Board board, String email) {
        boolean isOwner = board.getOwner().getEmail().equals(email);
        boolean isMember = boardMemberRepository.existsByBoardIdAndUserId(board.getId(),
            userRepository.findByEmail(email).map(User::getId).orElse(null));
        if (!isOwner && !isMember) throw new AccessDeniedException("Access denied");
    }

    private void assertOwner(Board board, String email) {
        if (!board.getOwner().getEmail().equals(email)) throw new AccessDeniedException("Only owner can do this");
    }
}
