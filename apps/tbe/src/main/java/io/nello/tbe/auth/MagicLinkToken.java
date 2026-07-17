package io.nello.tbe.auth;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "magic_link_tokens")
@Getter @Setter @NoArgsConstructor
public class MagicLinkToken {
    @Id private String id;
    @Column(nullable = false, unique = true) private String tokenHash;
    @Column(nullable = false) private String email;
    @Column(nullable = false) private Instant expiresAt;
    @Column(nullable = false) private boolean used = false;

    public static MagicLinkToken of(String email, String tokenHash, Instant expiresAt) {
        MagicLinkToken t = new MagicLinkToken();
        t.id = UUID.randomUUID().toString();
        t.email = email;
        t.tokenHash = tokenHash;
        t.expiresAt = expiresAt;
        return t;
    }
}
