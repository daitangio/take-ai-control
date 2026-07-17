package io.nello.tbe.card;

import io.nello.tbe.board.Board;
import io.nello.tbe.board.BoardService;
import io.nello.tbe.list.BoardList;
import io.nello.tbe.list.BoardListRepository;
import io.nello.tbe.ws.WebSocketBroadcaster;
import io.nello.tbe.auth.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CardServiceTest {

    @Mock CardRepository cardRepo;
    @Mock BoardListRepository listRepo;
    @Mock BoardService boardService;
    @Mock UserService userService;
    @Mock WebSocketBroadcaster broadcaster;
    @InjectMocks CardService service;

    @Test void createAppendsWith1000Gap() {
        Board board = Board.of("b", null);
        BoardList list = BoardList.of(board, "To Do", 1000);
        when(listRepo.findById("list1")).thenReturn(Optional.of(list));
        when(cardRepo.findMaxPositionByList(list)).thenReturn(2000);
        when(cardRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        Card card = service.create("list1", "My Task", "alice@example.com");
        assertThat(card.getPosition()).isEqualTo(3000);
    }

    @Test void moveUpdatesListAndPosition() {
        Board board = Board.of("b", null);
        BoardList src = BoardList.of(board, "To Do", 1000);
        BoardList dst = BoardList.of(board, "Done", 2000);
        Card card = Card.of(src, "Task", 1000);
        when(cardRepo.findById("c1")).thenReturn(Optional.of(card));
        when(listRepo.findById("dst")).thenReturn(Optional.of(dst));
        when(cardRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        service.move("c1", "dst", 500, "alice@example.com");
        assertThat(card.getList()).isEqualTo(dst);
        assertThat(card.getPosition()).isEqualTo(500);
    }
}
