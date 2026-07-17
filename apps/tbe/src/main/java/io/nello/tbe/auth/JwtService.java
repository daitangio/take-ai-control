package io.nello.tbe.auth;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class JwtService {

    @Value("${jwt.secret}") private String secret;
    @Value("${jwt.expiry-minutes:60}") private int expiryMinutes;

    public String issue(String email) {
        return JWT.create()
            .withSubject(email)
            .withIssuedAt(Instant.now())
            .withExpiresAt(Instant.now().plus(expiryMinutes, ChronoUnit.MINUTES))
            .sign(Algorithm.HMAC256(secret));
    }

    public String validate(String token) {
        try {
            return JWT.require(Algorithm.HMAC256(secret))
                .build()
                .verify(token)
                .getSubject();
        } catch (JWTVerificationException e) {
            throw new InvalidTokenException("Invalid JWT: " + e.getMessage());
        }
    }
}
