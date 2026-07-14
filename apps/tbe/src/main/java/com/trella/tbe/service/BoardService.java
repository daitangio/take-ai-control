package com.trella.tbe.service;

import com.trella.tbe.dto.*;
import com.trella.tbe.entity.CardEntity;
import com.trella.tbe.entity.ListEntity;
import com.trella.tbe.repository.CardRepository;
import com.trella.tbe.repository.ListRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class BoardService {

    private final ListRepository listRepo;
    private final CardRepository cardRepo;

    public BoardService(ListRepository listRepo, CardRepository cardRepo) {
        this.listRepo = listRepo;
        this.cardRepo = cardRepo;
    }

    @Transactional(readOnly = true)
    public BoardResponse getAllLists() {
        var lists = listRepo.findAllByOrderByPositionAsc().stream()
                .map(this::toListDto)
                .toList();
        return new BoardResponse(lists);
    }

    public ListDto createList(CreateListRequest req) {
        int nextPos = (int) listRepo.count();
        var entity = new ListEntity(UUID.randomUUID().toString(), req.title().trim(), nextPos);
        return toListDto(listRepo.save(entity));
    }

    public ListDto updateList(String id, UpdateListRequest req) {
        var entity = listRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("List not found: " + id));
        entity.setTitle(req.title().trim());
        return toListDto(listRepo.save(entity));
    }

    public void deleteList(String id) {
        if (!listRepo.existsById(id)) {
            throw new IllegalArgumentException("List not found: " + id);
        }
        listRepo.deleteById(id);
    }

    public CardDto addCard(String listId, CreateCardRequest req) {
        var list = listRepo.findById(listId)
                .orElseThrow(() -> new IllegalArgumentException("List not found: " + listId));
        int nextPos = cardRepo.countByListId(listId);
        var card = new CardEntity(UUID.randomUUID().toString(), req.text().trim(), nextPos, list);
        return toCardDto(cardRepo.save(card));
    }

    public CardDto updateCard(String id, UpdateCardRequest req) {
        var card = cardRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Card not found: " + id));
        card.setText(req.text().trim());
        return toCardDto(cardRepo.save(card));
    }

    public void deleteCard(String id) {
        if (!cardRepo.existsById(id)) {
            throw new IllegalArgumentException("Card not found: " + id);
        }
        cardRepo.deleteById(id);
    }

    public CardDto moveCard(String cardId, MoveCardRequest req) {
        var card = cardRepo.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Card not found: " + cardId));

        var targetList = listRepo.findById(req.targetListId())
                .orElseThrow(() -> new IllegalArgumentException("Target list not found: " + req.targetListId()));

        String sourceListId = card.getList().getId();
        String targetListId = req.targetListId();
        int targetPos = Math.max(0, req.position());

        if (sourceListId.equals(targetListId)) {
            reorderWithinList(sourceListId, card.getPosition(), targetPos);
        } else {
            // Remove from source: shift cards below it up
            shiftPositions(sourceListId, card.getPosition() + 1, -1);

            // Add to target: make room at targetPos
            shiftPositions(targetListId, targetPos, 1);

            // Place card at target position in new list
            card.setList(targetList);
            card.setPosition(Math.min(targetPos, cardRepo.countByListId(targetListId)));
        }

        return toCardDto(cardRepo.save(card));
    }

    private void reorderWithinList(String listId, int fromPos, int toPos) {
        var cards = cardRepo.findByListIdOrderByPositionAsc(listId);
        if (toPos >= cards.size()) {
            toPos = cards.size() - 1;
        }
        if (fromPos == toPos || fromPos < 0 || toPos < 0) return;

        var moved = cards.remove(fromPos);
        cards.add(toPos, moved);

        for (int i = 0; i < cards.size(); i++) {
            cards.get(i).setPosition(i);
        }
        cardRepo.saveAll(cards);
    }

    private void shiftPositions(String listId, int fromPos, int delta) {
        var cards = cardRepo.findByListIdOrderByPositionAsc(listId);
        for (var c : cards) {
            if (c.getPosition() >= fromPos) {
                c.setPosition(c.getPosition() + delta);
            }
        }
        cardRepo.saveAll(cards);
    }

    private ListDto toListDto(ListEntity entity) {
        var cards = entity.getCards().stream()
                .map(this::toCardDto)
                .toList();
        return new ListDto(entity.getId(), entity.getTitle(), cards);
    }

    private CardDto toCardDto(CardEntity entity) {
        return new CardDto(entity.getId(), entity.getText());
    }
}
