package io.nello.tbe.card;

import io.nello.tbe.auth.User;
import io.nello.tbe.list.BoardList;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity @Table(name = "cards")
@Audited
@Getter @Setter @NoArgsConstructor
public class Card {
    @Id private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", nullable = false)
    private BoardList list;
    @Column(nullable = false) private String title;
    @Column(columnDefinition = "TEXT") private String description;
    private LocalDate dueDate;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;
    @Column(nullable = false) private int position;
    @Column(nullable = false) private Instant createdAt;

    public static Card of(BoardList list, String title, int position) {
        Card c = new Card();
        c.id = UUID.randomUUID().toString();
        c.list = list;
        c.title = title;
        c.position = position;
        c.createdAt = Instant.now();
        return c;
    }
}
