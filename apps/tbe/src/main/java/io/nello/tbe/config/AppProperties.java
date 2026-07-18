package io.nello.tbe.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Getter @Setter
@Configuration
@ConfigurationProperties(prefix = "nello")
public class AppProperties {
    private List<String> allowedEmailDomains = List.of(".*");
    private boolean mock = true;
    private String appBaseUrl = "http://localhost:5173";
}
