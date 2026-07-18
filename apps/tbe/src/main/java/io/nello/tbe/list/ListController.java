package io.nello.tbe.list;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/boards/{boardId}/lists")
@RequiredArgsConstructor
public class ListController {

    private final ListService listService;

    @GetMapping
    public List<BoardList> list(@AuthenticationPrincipal String email, @PathVariable UUID boardId) {
        return listService.getLists(boardId, email);
    }

    @PostMapping
    public BoardList create(@AuthenticationPrincipal String email, @PathVariable UUID boardId,
                            @RequestBody Map<String, String> body) {
        return listService.createList(boardId, body.get("name"), email);
    }

    @PatchMapping("/{listId}")
    public BoardList rename(@AuthenticationPrincipal String email, @PathVariable UUID boardId,
                            @PathVariable UUID listId, @RequestBody Map<String, Object> body) {
        if (body.containsKey("name")) {
            return listService.renameList(boardId, listId, (String) body.get("name"), email);
        }
        return listService.moveList(boardId, listId, (Integer) body.get("position"), email);
    }

    @DeleteMapping("/{listId}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal String email, @PathVariable UUID boardId,
                                       @PathVariable UUID listId) {
        listService.deleteList(boardId, listId, email);
        return ResponseEntity.noContent().build();
    }
}
