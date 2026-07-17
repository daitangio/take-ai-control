package io.nello.tbe.auth;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import static org.assertj.core.api.Assertions.*;

class EmailDomainValidatorTest {

    private EmailDomainValidator validator() {
        EmailDomainValidator v = new EmailDomainValidator();
        ReflectionTestUtils.setField(v, "allowedEmailDomainsList", ".*@example\\.com,.*@nello\\.io");
        return v;
    }

    @Test void allowsMatchingDomain() {
        assertThat(validator().isAllowed("alice@example.com")).isTrue();
        assertThat(validator().isAllowed("bob@nello.io")).isTrue();
    }

    @Test void rejectsNonMatchingDomain() {
        assertThat(validator().isAllowed("eve@evil.org")).isFalse();
    }

    @Test void rejectsWhenListEmpty() {
        EmailDomainValidator v = new EmailDomainValidator();
        ReflectionTestUtils.setField(v, "allowedEmailDomainsList", "");
        assertThat(v.isAllowed("alice@example.com")).isFalse();
    }
}
