package io.nello.tbe.card;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/boards/{boardId}/lists/{listId}/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    @GetMapping
    public List<Card> list(@AuthenticationPrincipal String email,
                           @PathVariable UUID boardId, @PathVariable UUID listId) {
        return cardService.getCards(boardId, listId, email);
    }

    @PostMapping
    public Card create(@AuthenticationPrincipal String email,
                       @PathVariable UUID boardId, @PathVariable UUID listId,
                       @RequestBody Map<String, String> body) {
        return cardService.createCard(boardId, listId, body.get("title"), email);
    }

    @PatchMapping("/{cardId}")
    public Card update(@AuthenticationPrincipal String email,
                       @PathVariable UUID boardId, @PathVariable UUID listId, @PathVariable UUID cardId,
                       @RequestBody Map<String, Object> body) {
        return cardService.updateCard(boardId, listId, cardId, body, email);
    }

    @PostMapping("/{cardId}/move")
    public Card move(@AuthenticationPrincipal String email,
                     @PathVariable UUID boardId, @PathVariable UUID listId, @PathVariable UUID cardId,
                     @RequestBody Map<String, Object> body) {
        UUID targetListId = UUID.fromString((String) body.get("targetListId"));
        int position = (int) body.get("position");
        return cardService.moveCard(boardId, cardId, targetListId, position, email);
    }

    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal String email,
                                       @PathVariable UUID boardId, @PathVariable UUID listId,
                                       @PathVariable UUID cardId) {
        cardService.deleteCard(boardId, listId, cardId, email);
        return ResponseEntity.noContent().build();
    }
}
