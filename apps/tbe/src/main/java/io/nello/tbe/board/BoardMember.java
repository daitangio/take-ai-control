package io.nello.tbe.board;

import io.nello.tbe.auth.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity @Table(name = "board_members")
@Getter @NoArgsConstructor
@IdClass(BoardMember.BoardMemberId.class)
public class BoardMember {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    private Board board;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public static BoardMember of(Board board, User user) {
        BoardMember m = new BoardMember();
        m.board = board;
        m.user = user;
        return m;
    }

    public record BoardMemberId(String board, String user) implements Serializable {}
}
