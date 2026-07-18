package io.nello.tbe.board;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @GetMapping
    public List<Board> list(@AuthenticationPrincipal String email) {
        return boardService.listBoards(email);
    }

    @PostMapping
    public Board create(@AuthenticationPrincipal String email, @RequestBody Map<String, String> body) {
        return boardService.createBoard(body.get("name"), email);
    }

    @GetMapping("/{boardId}")
    public Board get(@AuthenticationPrincipal String email, @PathVariable UUID boardId) {
        return boardService.getBoard(boardId, email);
    }

    @PatchMapping("/{boardId}")
    public Board rename(@AuthenticationPrincipal String email, @PathVariable UUID boardId,
                        @RequestBody Map<String, String> body) {
        return boardService.renameBoard(boardId, body.get("name"), email);
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal String email, @PathVariable UUID boardId) {
        boardService.deleteBoard(boardId, email);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{boardId}/members")
    public ResponseEntity<Void> addMember(@AuthenticationPrincipal String email,
                                          @PathVariable UUID boardId,
                                          @RequestBody Map<String, String> body) {
        boardService.addMember(boardId, body.get("email"), email);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{boardId}/members/{memberEmail}")
    public ResponseEntity<Void> removeMember(@AuthenticationPrincipal String email,
                                             @PathVariable UUID boardId,
                                             @PathVariable String memberEmail) {
        boardService.removeMember(boardId, memberEmail, email);
        return ResponseEntity.noContent().build();
    }
}
