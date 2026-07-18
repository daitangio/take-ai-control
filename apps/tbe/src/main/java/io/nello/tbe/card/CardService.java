package io.nello.tbe.card;

import io.nello.tbe.auth.UserRepository;
import io.nello.tbe.board.BoardService;
import io.nello.tbe.list.BoardList;
import io.nello.tbe.list.BoardListRepository;
import io.nello.tbe.ws.BoardEvent;
import io.nello.tbe.ws.WebSocketBroadcaster;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final BoardListRepository listRepository;
    private final BoardService boardService;
    private final UserRepository userRepository;
    private final WebSocketBroadcaster broadcaster;

    @Transactional(readOnly = true)
    public List<Card> getCards(UUID boardId, UUID listId, String email) {
        boardService.getBoard(boardId, email);
        return cardRepository.findByListIdOrderByPosition(listId);
    }

    @Transactional
    public Card createCard(UUID boardId, UUID listId, String title, String email) {
        boardService.getBoard(boardId, email);
        BoardList list = listRepository.findByIdAndBoardId(listId, boardId)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("List not found"));
        int maxPos = cardRepository.findMaxPosition(listId);
        Card card = cardRepository.save(new Card(list, title, maxPos + 1000));
        broadcaster.send(boardId, new BoardEvent("CREATED", "CARD", card));
        return card;
    }

    @Transactional
    public Card updateCard(UUID boardId, UUID listId, UUID cardId, Map<String, Object> updates, String email) {
        boardService.getBoard(boardId, email);
        Card card = cardRepository.findByIdAndListId(cardId, listId)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Card not found"));
        if (updates.containsKey("title")) card.setTitle((String) updates.get("title"));
        if (updates.containsKey("description")) card.setDescription((String) updates.get("description"));
        if (updates.containsKey("dueDate")) {
            String d = (String) updates.get("dueDate");
            card.setDueDate(d == null ? null : LocalDate.parse(d));
        }
        if (updates.containsKey("assigneeEmail")) {
            String ae = (String) updates.get("assigneeEmail");
            card.setAssignee(ae == null ? null : userRepository.findByEmail(ae).orElse(null));
        }
        Card saved = cardRepository.save(card);
        broadcaster.send(boardId, new BoardEvent("UPDATED", "CARD", saved));
        return saved;
    }

    @Transactional
    public Card moveCard(UUID boardId, UUID cardId, UUID targetListId, int newPosition, String email) {
        boardService.getBoard(boardId, email);
        Card card = cardRepository.findById(cardId)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Card not found"));
        BoardList targetList = listRepository.findByIdAndBoardId(targetListId, boardId)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Target list not found"));
        card.setList(targetList);
        card.setPosition(newPosition);
        // Renumber if needed
        renumberIfNeeded(targetListId);
        Card saved = cardRepository.save(card);
        broadcaster.send(boardId, new BoardEvent("MOVED", "CARD", saved));
        return saved;
    }

    @Transactional
    public void deleteCard(UUID boardId, UUID listId, UUID cardId, String email) {
        boardService.getBoard(boardId, email);
        Card card = cardRepository.findByIdAndListId(cardId, listId)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Card not found"));
        cardRepository.delete(card);
        broadcaster.send(boardId, new BoardEvent("DELETED", "CARD", Map.of("id", cardId)));
    }

    /** Renumber cards in a list if any two cards have colliding positions */
    private void renumberIfNeeded(UUID listId) {
        List<Card> cards = cardRepository.findByListIdOrderByPositionAsc(listId);
        boolean hasCollision = false;
        for (int i = 1; i < cards.size(); i++) {
            if (cards.get(i).getPosition() <= cards.get(i - 1).getPosition()) {
                hasCollision = true;
                break;
            }
        }
        if (hasCollision) {
            for (int i = 0; i < cards.size(); i++) {
                cards.get(i).setPosition((i + 1) * 1000);
            }
            cardRepository.saveAll(cards);
        }
    }
}
