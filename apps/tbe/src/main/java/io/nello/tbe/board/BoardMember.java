package io.nello.tbe.board;

import io.nello.tbe.auth.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "board_members")
@Getter @NoArgsConstructor
public class BoardMember {

    @Embeddable
    public static class Id implements Serializable {
        @Column(name = "board_id")
        private UUID boardId;
        @Column(name = "user_id")
        private UUID userId;

        public Id() {}
        public Id(UUID boardId, UUID userId) { this.boardId = boardId; this.userId = userId; }

        @Override public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Id id)) return false;
            return Objects.equals(boardId, id.boardId) && Objects.equals(userId, id.userId);
        }
        @Override public int hashCode() { return Objects.hash(boardId, userId); }
    }

    @EmbeddedId
    private Id id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("boardId")
    @JoinColumn(name = "board_id")
    private Board board;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    public BoardMember(Board board, User user) {
        this.board = board;
        this.user = user;
        this.id = new Id(board.getId(), user.getId());
    }
}
