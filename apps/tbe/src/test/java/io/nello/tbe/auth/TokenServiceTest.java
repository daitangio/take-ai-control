package io.nello.tbe.auth;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TokenServiceTest {

    @Mock MagicLinkTokenRepository tokenRepository;
    @InjectMocks TokenService tokenService;

    @Test
    void createTokenReturnsBase64UrlString() {
        when(tokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        String token = tokenService.createToken("user@example.com");
        assertThat(token).isNotBlank().doesNotContain("+", "/", "=");
    }

    @Test
    void verifyTokenSucceeds() {
        when(tokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        String raw = tokenService.createToken("user@example.com");
        String hash = TokenService.sha256(raw);

        MagicLinkToken stored = new MagicLinkToken(hash, "user@example.com", Instant.now().plusSeconds(900));
        when(tokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(stored));

        String email = tokenService.verifyToken(raw);
        assertThat(email).isEqualTo("user@example.com");
        assertThat(stored.isUsed()).isTrue();
    }

    @Test
    void verifyTokenFailsWhenExpired() {
        when(tokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        String raw = tokenService.createToken("user@example.com");
        String hash = TokenService.sha256(raw);

        MagicLinkToken expired = new MagicLinkToken(hash, "user@example.com", Instant.now().minusSeconds(1));
        when(tokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> tokenService.verifyToken(raw))
            .isInstanceOf(InvalidTokenException.class)
            .hasMessageContaining("expired");
    }

    @Test
    void verifyTokenFailsWhenAlreadyUsed() {
        when(tokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        String raw = tokenService.createToken("user@example.com");
        String hash = TokenService.sha256(raw);

        MagicLinkToken used = new MagicLinkToken(hash, "user@example.com", Instant.now().plusSeconds(900));
        used.setUsed(true);
        when(tokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(used));

        assertThatThrownBy(() -> tokenService.verifyToken(raw))
            .isInstanceOf(InvalidTokenException.class)
            .hasMessageContaining("already used");
    }
}
