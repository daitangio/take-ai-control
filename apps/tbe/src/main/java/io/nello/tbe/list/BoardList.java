package io.nello.tbe.list;

import io.nello.tbe.board.Board;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;

import java.util.UUID;

@Entity
@Table(name = "board_lists")
@Audited
@Getter @Setter @NoArgsConstructor
public class BoardList {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    @org.hibernate.envers.NotAudited
    private Board board;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int position = 1000;

    public BoardList(Board board, String name, int position) {
        this.board = board;
        this.name = name;
        this.position = position;
    }
}
