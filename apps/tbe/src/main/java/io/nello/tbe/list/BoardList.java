package io.nello.tbe.list;

import io.nello.tbe.board.Board;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;
import java.util.UUID;

@Entity @Table(name = "board_lists")
@Audited
@Getter @Setter @NoArgsConstructor
public class BoardList {
    @Id private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private int position;

    public static BoardList of(Board board, String name, int position) {
        BoardList l = new BoardList();
        l.id = UUID.randomUUID().toString();
        l.board = board;
        l.name = name;
        l.position = position;
        return l;
    }
}
