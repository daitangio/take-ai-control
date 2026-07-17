package io.nello.tbe.board;

import io.nello.tbe.auth.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "boards")
@Audited
@Getter @Setter @NoArgsConstructor
public class Board {
    @Id private String id;
    @Column(nullable = false) private String name;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
    @Column(nullable = false) private Instant createdAt;

    public static Board of(String name, User owner) {
        Board b = new Board();
        b.id = UUID.randomUUID().toString();
        b.name = name;
        b.owner = owner;
        b.createdAt = Instant.now();
        return b;
    }
}
