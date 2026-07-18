package io.nello.tbe.card;

import io.nello.tbe.auth.UserRepository;
import io.nello.tbe.board.BoardService;
import io.nello.tbe.list.BoardList;
import io.nello.tbe.list.BoardListRepository;
import io.nello.tbe.ws.WebSocketBroadcaster;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CardServiceTest {

    @Mock CardRepository cardRepository;
    @Mock BoardListRepository listRepository;
    @Mock BoardService boardService;
    @Mock UserRepository userRepository;
    @Mock WebSocketBroadcaster broadcaster;
    @InjectMocks CardService cardService;

    private UUID boardId;
    private UUID listId;
    private BoardList boardList;

    @BeforeEach
    void setUp() {
        boardId = UUID.randomUUID();
        listId = UUID.randomUUID();
        boardList = new BoardList();
        boardList.setId(listId);
    }

    @Test
    void createCardAppendsAfterMaxPosition() {
        when(listRepository.findByIdAndBoardId(listId, boardId)).thenReturn(Optional.of(boardList));
        when(cardRepository.findMaxPosition(listId)).thenReturn(2000);
        when(cardRepository.save(any())).thenAnswer(inv -> {
            Card c = inv.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        Card card = cardService.createCard(boardId, listId, "Test card", "user@example.com");

        assertThat(card.getPosition()).isEqualTo(3000);
        assertThat(card.getTitle()).isEqualTo("Test card");
    }

    @Test
    void moveCardRenumbersOnCollision() {
        UUID cardId = UUID.randomUUID();
        UUID targetListId = UUID.randomUUID();
        BoardList targetList = new BoardList();
        targetList.setId(targetListId);

        Card card = new Card();
        card.setId(cardId);
        card.setList(boardList);
        card.setPosition(1000);

        // Simulate collision: two cards at the same position
        Card other = new Card();
        other.setId(UUID.randomUUID());
        other.setList(targetList);
        other.setPosition(500);

        Card card2 = new Card();
        card2.setId(UUID.randomUUID());
        card2.setList(targetList);
        card2.setPosition(500); // collision

        when(cardRepository.findById(cardId)).thenReturn(Optional.of(card));
        when(listRepository.findByIdAndBoardId(targetListId, boardId)).thenReturn(Optional.of(targetList));
        when(cardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(cardRepository.findByListIdOrderByPositionAsc(targetListId))
            .thenReturn(List.of(other, card2));

        cardService.moveCard(boardId, cardId, targetListId, 500, "user@example.com");

        // renumberIfNeeded should have called saveAll
        verify(cardRepository).saveAll(any());
    }
}
