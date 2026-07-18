package io.nello.tbe.auth;

import io.nello.tbe.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class EmailDomainValidator {

    private final AppProperties appProperties;

    public boolean isAllowed(String email) {
        if (email == null || !email.contains("@")) return false;
        List<String> patterns = appProperties.getAllowedEmailDomains();
        if (patterns == null || patterns.isEmpty()) return false;
        return patterns.stream().anyMatch(p -> Pattern.matches(p, email));
    }
}
