package com.trella.tbe.service;

import com.trella.tbe.dto.*;
import com.trella.tbe.entity.CardEntity;
import com.trella.tbe.entity.ListEntity;
import com.trella.tbe.repository.CardRepository;
import com.trella.tbe.repository.ListRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BoardServiceTest {

    @Mock ListRepository listRepo;
    @Mock CardRepository cardRepo;
    @InjectMocks BoardService service;

    private ListEntity list;
    private CardEntity card;

    @BeforeEach
    void setUp() {
        list = new ListEntity("l1", "To Do", 0);
        card = new CardEntity("c1", "Hello", 0, list);
        list.setCards(new ArrayList<>(List.of(card)));
        lenient().when(listRepo.count()).thenReturn(1L);
    }

    @Test
    void getAllLists() {
        when(listRepo.findAllByOrderByPositionAsc()).thenReturn(List.of(list));
        var result = service.getAllLists();
        assertThat(result.lists()).hasSize(1);
        assertThat(result.lists().get(0).title()).isEqualTo("To Do");
        assertThat(result.lists().get(0).cards()).hasSize(1);
    }

    @Test
    void createList() {
        when(listRepo.save(any())).thenReturn(list);
        var result = service.createList(new CreateListRequest("  To Do  "));
        assertThat(result.title()).isEqualTo("To Do");
    }

    @Test
    void updateList() {
        when(listRepo.findById("l1")).thenReturn(Optional.of(list));
        when(listRepo.save(any())).thenReturn(list);
        var result = service.updateList("l1", new UpdateListRequest("Done"));
        assertThat(list.getTitle()).isEqualTo("Done");
    }

    @Test
    void updateList_notFound() {
        when(listRepo.findById("nope")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.updateList("nope", new UpdateListRequest("X")))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void deleteList() {
        when(listRepo.existsById("l1")).thenReturn(true);
        service.deleteList("l1");
        verify(listRepo).deleteById("l1");
    }

    @Test
    void deleteList_notFound() {
        when(listRepo.existsById("nope")).thenReturn(false);
        assertThatThrownBy(() -> service.deleteList("nope"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void addCard() {
        when(listRepo.findById("l1")).thenReturn(Optional.of(list));
        when(cardRepo.countByListId("l1")).thenReturn(1);
        when(cardRepo.save(any())).thenReturn(card);
        var result = service.addCard("l1", new CreateCardRequest("New"));
        assertThat(result.text()).isEqualTo("Hello");
    }

    @Test
    void updateCard() {
        when(cardRepo.findById("c1")).thenReturn(Optional.of(card));
        when(cardRepo.save(any())).thenReturn(card);
        service.updateCard("c1", new UpdateCardRequest("Updated"));
        assertThat(card.getText()).isEqualTo("Updated");
    }

    @Test
    void deleteCard() {
        when(cardRepo.existsById("c1")).thenReturn(true);
        service.deleteCard("c1");
        verify(cardRepo).deleteById("c1");
    }

    @Test
    void moveCard_sameList() {
        var card2 = new CardEntity("c2", "Second", 1, list);
        list.setCards(new ArrayList<>(List.of(card, card2)));

        when(cardRepo.findById("c1")).thenReturn(Optional.of(card));
        when(listRepo.findById("l1")).thenReturn(Optional.of(list));
        when(cardRepo.findByListIdOrderByPositionAsc("l1")).thenReturn(new ArrayList<>(list.getCards()));
        when(cardRepo.save(any(CardEntity.class))).thenReturn(card);

        service.moveCard("c1", new MoveCardRequest("l1", 1));

        // card should now be at position 1
        assertThat(card.getPosition()).isEqualTo(1);
    }

    @Test
    void moveCard_crossList() {
        var targetList = new ListEntity("l2", "Done", 1);
        targetList.setCards(new ArrayList<>());

        when(cardRepo.findById("c1")).thenReturn(Optional.of(card));
        when(listRepo.findById("l2")).thenReturn(Optional.of(targetList));
        when(cardRepo.save(any(CardEntity.class))).thenReturn(card);

        service.moveCard("c1", new MoveCardRequest("l2", 0));

        assertThat(card.getList()).isEqualTo(targetList);
    }

    @Test
    void moveCard_cardNotFound() {
        when(cardRepo.findById("nope")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.moveCard("nope", new MoveCardRequest("l1", 0)))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
