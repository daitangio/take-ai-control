package io.nello.tbe.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MagicLinkTokenRepository extends JpaRepository<MagicLinkToken, String> {
    Optional<MagicLinkToken> findByTokenHash(String tokenHash);
}
