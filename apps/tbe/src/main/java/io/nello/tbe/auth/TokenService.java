package io.nello.tbe.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final MagicLinkTokenRepository tokenRepository;
    private static final int TOKEN_BYTES = 32;
    private static final int EXPIRY_MINUTES = 15;

    @Transactional
    public String createToken(String email) {
        byte[] raw = new byte[TOKEN_BYTES];
        new SecureRandom().nextBytes(raw);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        String hash = sha256(rawToken);
        Instant expiresAt = Instant.now().plusSeconds(EXPIRY_MINUTES * 60L);
        tokenRepository.save(new MagicLinkToken(hash, email, expiresAt));
        return rawToken;
    }

    @Transactional
    public String verifyToken(String rawToken) {
        String hash = sha256(rawToken);
        MagicLinkToken token = tokenRepository.findByTokenHash(hash)
            .orElseThrow(() -> new InvalidTokenException("Token not found"));
        if (token.isUsed()) throw new InvalidTokenException("Token already used");
        if (token.getExpiresAt().isBefore(Instant.now())) throw new InvalidTokenException("Token expired");
        token.setUsed(true);
        return token.getEmail();
    }

    static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
