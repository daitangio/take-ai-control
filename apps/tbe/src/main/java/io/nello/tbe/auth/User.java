package io.nello.tbe.auth;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "users")
@Getter @Setter @NoArgsConstructor
public class User {
    @Id private String id;
    @Column(nullable = false, unique = true) private String email;
    @Column(nullable = false) private Instant createdAt;

    public static User of(String email) {
        User u = new User();
        u.id = UUID.randomUUID().toString();
        u.email = email;
        u.createdAt = Instant.now();
        return u;
    }
}
