package io.nello.tbe.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import java.util.List;

@ConfigurationProperties(prefix = "nello")
public record AppProperties(
    String allowedEmailDomainsList,
    int magicLinkExpiryMinutes,
    Jwt jwt,
    Mail mail,
    Cors cors,
    Admin admin
) {
    public record Jwt(String secret, int expiryMinutes) {}
    public record Mail(String from, boolean mock) {}
    public record Cors(String allowedOrigin) {}
    public record Admin(String email) {}
}
