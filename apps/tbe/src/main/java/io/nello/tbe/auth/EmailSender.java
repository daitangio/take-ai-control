package io.nello.tbe.auth;

import io.nello.tbe.config.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailSender {

    private final JavaMailSender mailSender;
    private final AppProperties appProperties;

    /**
     * Sends a magic-link email. In mock mode (nello.mock=true), logs the raw token and
     * returns it so the frontend can auto-redirect without SMTP setup.
     *
     * @return the raw token if mock=true; null otherwise
     */
    public String sendMagicLink(String email, String rawToken) {
        String link = appProperties.getAppBaseUrl() + "/auth/callback?token=" + rawToken;
        if (appProperties.isMock()) {
            log.info("[MOCK] Magic link for {}: {}", email, link);
            return rawToken;
        }
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(email);
        msg.setSubject("Your Nello login link");
        msg.setText("Click to log in (valid 15 minutes):\n" + link);
        mailSender.send(msg);
        return null;
    }
}
