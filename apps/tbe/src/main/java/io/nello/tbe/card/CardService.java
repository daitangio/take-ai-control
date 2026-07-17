package io.nello.tbe.card;

import io.nello.tbe.auth.User;
import io.nello.tbe.auth.UserService;
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

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepo;
    private final BoardListRepository listRepo;
    private final BoardService boardService;
    private final UserService userService;
    private final WebSocketBroadcaster broadcaster;

    public List<Card> getCards(String listId, String email) {
        BoardList list = listRepo.findById(listId).orElseThrow();
        boardService.get(list.getBoard().getId(), email);
        return cardRepo.findByListOrderByPosition(list);
    }

    @Transactional
    public Card create(String listId, String title, String email) {
        BoardList list = listRepo.findById(listId).orElseThrow();
        boardService.get(list.getBoard().getId(), email);
        int pos = cardRepo.findMaxPositionByList(list) + 1000;
        Card card = cardRepo.save(Card.of(list, title, pos));
        broadcaster.send(list.getBoard().getId(), new BoardEvent("CREATED", "CARD", card));
        return card;
    }

    @Transactional
    public Card update(String cardId, String title, String description,
                       LocalDate dueDate, String assigneeEmail, String email) {
        Card card = cardRepo.findById(cardId).orElseThrow();
        boardService.get(card.getList().getBoard().getId(), email);
        if (title != null) card.setTitle(title);
        if (description != null) card.setDescription(description);
        card.setDueDate(dueDate);
        if (assigneeEmail != null) {
            User assignee = userService.getByEmail(assigneeEmail);
            card.setAssignee(assignee);
        } else {
            card.setAssignee(null);
        }
        Card saved = cardRepo.save(card);
        broadcaster.send(card.getList().getBoard().getId(), new BoardEvent("UPDATED", "CARD", saved));
        return saved;
    }

    @Transactional
    public void move(String cardId, String targetListId, int newPosition, String email) {
        Card card = cardRepo.findById(cardId).orElseThrow();
        String boardId = card.getList().getBoard().getId();
        boardService.get(boardId, email);
        BoardList targetList = listRepo.findById(targetListId).orElseThrow();
        card.setList(targetList);
        card.setPosition(newPosition);
        Card saved = cardRepo.save(card);
        broadcaster.send(boardId, new BoardEvent("MOVED", "CARD", saved));
    }

    @Transactional
    public void delete(String cardId, String email) {
        Card card = cardRepo.findById(cardId).orElseThrow();
        String boardId = card.getList().getBoard().getId();
        boardService.get(boardId, email);
        cardRepo.delete(card);
        broadcaster.send(boardId, new BoardEvent("DELETED", "CARD", cardId));
    }
}
