package io.nello.tbe.board;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService service;

    record CreateBoardBody(String name) {}
    record ShareBody(String email) {}

    @GetMapping
    public List<Board> list(@AuthenticationPrincipal String email) {
        return service.listForUser(email);
    }

    @PostMapping
    public ResponseEntity<Board> create(@AuthenticationPrincipal String email,
                                        @RequestBody CreateBoardBody body) {
        return ResponseEntity.ok(service.create(body.name(), email));
    }

    @GetMapping("/{id}")
    public Board get(@AuthenticationPrincipal String email, @PathVariable String id) {
        return service.get(id, email);
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<Void> share(@AuthenticationPrincipal String email,
                                      @PathVariable String id,
                                      @RequestBody ShareBody body) {
        service.share(id, email, body.email());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal String email,
                                       @PathVariable String id) {
        service.delete(id, email);
        return ResponseEntity.noContent().build();
    }
}
