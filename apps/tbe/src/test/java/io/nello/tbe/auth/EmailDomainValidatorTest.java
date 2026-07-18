package io.nello.tbe.auth;

import io.nello.tbe.config.AppProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class EmailDomainValidatorTest {

    private EmailDomainValidator validator;

    @BeforeEach
    void setUp() {
        AppProperties props = new AppProperties();
        props.setAllowedEmailDomains(List.of(".*@example\\.com", ".*@.*\\.org"));
        validator = new EmailDomainValidator(props);
    }

    @Test
    void allowsMatchingDomain() {
        assertThat(validator.isAllowed("user@example.com")).isTrue();
        assertThat(validator.isAllowed("user@test.org")).isTrue();
    }

    @Test
    void rejectsNonMatchingDomain() {
        assertThat(validator.isAllowed("user@other.com")).isFalse();
        assertThat(validator.isAllowed("user@example.net")).isFalse();
    }

    @Test
    void rejectsInvalidEmail() {
        assertThat(validator.isAllowed(null)).isFalse();
        assertThat(validator.isAllowed("notanemail")).isFalse();
    }
}
