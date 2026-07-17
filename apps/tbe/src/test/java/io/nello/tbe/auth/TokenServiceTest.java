package io.nello.tbe.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import java.time.Instant;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TokenServiceTest {

    @Mock MagicLinkTokenRepository repo;
    @InjectMocks TokenService service;

    @BeforeEach void setup() {
        ReflectionTestUtils.setField(service, "expiryMinutes", 15);
    }

    @Test void createTokenSavesHashedToken() {
        when(repo.save(any())).thenAnswer(i -> i.getArgument(0));
        String raw = service.createToken("alice@example.com");
        assertThat(raw).isNotBlank();
        verify(repo).save(any(MagicLinkToken.class));
    }

    @Test void verifyTokenFailsWhenUsed() {
        MagicLinkToken token = MagicLinkToken.of("alice@example.com", "hash",
            Instant.now().plusSeconds(900));
        token.setUsed(true);
        when(repo.findByTokenHash(any())).thenReturn(Optional.of(token));
        assertThatThrownBy(() -> service.verifyToken("someraw"))
            .isInstanceOf(InvalidTokenException.class);
    }

    @Test void verifyTokenFailsWhenExpired() {
        MagicLinkToken token = MagicLinkToken.of("alice@example.com", "hash",
            Instant.now().minusSeconds(1));
        when(repo.findByTokenHash(any())).thenReturn(Optional.of(token));
        assertThatThrownBy(() -> service.verifyToken("someraw"))
            .isInstanceOf(InvalidTokenException.class);
    }
}
