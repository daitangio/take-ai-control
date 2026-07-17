package io.nello.tbe.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final MagicLinkTokenRepository repo;
    private final SecureRandom random = new SecureRandom();

    @Value("${magic-link.expiry-minutes:15}")
    private int expiryMinutes;

    @Transactional
    public String createToken(String email) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        String hash = sha256(raw);
        Instant expires = Instant.now().plus(expiryMinutes, ChronoUnit.MINUTES);
        repo.save(MagicLinkToken.of(email, hash, expires));
        return raw;
    }

    @Transactional
    public String verifyToken(String raw) {
        String hash = sha256(raw);
        MagicLinkToken token = repo.findByTokenHash(hash)
            .orElseThrow(() -> new InvalidTokenException("Token not found"));
        if (token.isUsed()) throw new InvalidTokenException("Token already used");
        if (Instant.now().isAfter(token.getExpiresAt())) throw new InvalidTokenException("Token expired");
        token.setUsed(true);
        repo.save(token);
        return token.getEmail();
    }

    private String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
