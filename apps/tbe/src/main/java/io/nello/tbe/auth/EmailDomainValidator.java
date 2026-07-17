package io.nello.tbe.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class EmailDomainValidator {

    @Value("${allowed_email_domains_list:}")
    private String allowedEmailDomainsList;

    public boolean isAllowed(String email) {
        if (allowedEmailDomainsList == null || allowedEmailDomainsList.isBlank()) return false;
        return Arrays.stream(allowedEmailDomainsList.split(","))
            .map(String::trim)
            .filter(p -> !p.isBlank())
            .anyMatch(pattern -> email.matches(pattern));
    }
}
