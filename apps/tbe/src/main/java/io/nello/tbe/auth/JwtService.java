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

    private final Algorithm algorithm;
    private final long expiryMinutes;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiry-minutes:60}") long expiryMinutes) {
        this.algorithm = Algorithm.HMAC256(secret);
        this.expiryMinutes = expiryMinutes;
    }

    public String issue(String email) {
        return JWT.create()
            .withSubject(email)
            .withIssuedAt(Instant.now())
            .withExpiresAt(Instant.now().plus(expiryMinutes, ChronoUnit.MINUTES))
            .sign(algorithm);
    }

    public String validateAndGetEmail(String token) throws JWTVerificationException {
        return JWT.require(algorithm).build().verify(token).getSubject();
    }
}
