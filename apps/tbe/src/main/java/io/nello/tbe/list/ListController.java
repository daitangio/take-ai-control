package io.nello.tbe.list;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/boards/{boardId}/lists")
@RequiredArgsConstructor
public class ListController {

    private final ListService service;

    record CreateListBody(String name) {}
    record RenameListBody(String name) {}

    @GetMapping
    public List<BoardList> getAll(@AuthenticationPrincipal String email,
                                  @PathVariable String boardId) {
        return service.getListsForBoard(boardId, email);
    }

    @PostMapping
    public ResponseEntity<BoardList> create(@AuthenticationPrincipal String email,
                                            @PathVariable String boardId,
                                            @RequestBody CreateListBody body) {
        return ResponseEntity.ok(service.create(boardId, body.name(), email));
    }

    @PatchMapping("/{listId}")
    public ResponseEntity<BoardList> rename(@AuthenticationPrincipal String email,
                                            @PathVariable String boardId,
                                            @PathVariable String listId,
                                            @RequestBody RenameListBody body) {
        return ResponseEntity.ok(service.rename(listId, body.name(), email));
    }

    @DeleteMapping("/{listId}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal String email,
                                       @PathVariable String boardId,
                                       @PathVariable String listId) {
        service.delete(listId, email);
        return ResponseEntity.noContent().build();
    }
}
