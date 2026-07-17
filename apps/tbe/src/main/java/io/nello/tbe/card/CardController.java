package io.nello.tbe.card;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/lists/{listId}/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService service;

    record CreateCardBody(String title) {}
    record UpdateCardBody(String title, String description, LocalDate dueDate, String assigneeEmail) {}
    record MoveCardBody(String targetListId, int position) {}

    @GetMapping
    public List<Card> getAll(@AuthenticationPrincipal String email, @PathVariable String listId) {
        return service.getCards(listId, email);
    }

    @PostMapping
    public ResponseEntity<Card> create(@AuthenticationPrincipal String email,
                                       @PathVariable String listId,
                                       @RequestBody CreateCardBody body) {
        return ResponseEntity.ok(service.create(listId, body.title(), email));
    }

    @PatchMapping("/{cardId}")
    public ResponseEntity<Card> update(@AuthenticationPrincipal String email,
                                       @PathVariable String listId,
                                       @PathVariable String cardId,
                                       @RequestBody UpdateCardBody body) {
        return ResponseEntity.ok(service.update(cardId, body.title(), body.description(),
                                                body.dueDate(), body.assigneeEmail(), email));
    }

    @PatchMapping("/{cardId}/move")
    public ResponseEntity<Void> move(@AuthenticationPrincipal String email,
                                     @PathVariable String listId,
                                     @PathVariable String cardId,
                                     @RequestBody MoveCardBody body) {
        service.move(cardId, body.targetListId(), body.position(), email);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal String email,
                                       @PathVariable String listId,
                                       @PathVariable String cardId) {
        service.delete(cardId, email);
        return ResponseEntity.noContent().build();
    }
}
