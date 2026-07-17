package io.nello.tbe.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailSender {

    private final JavaMailSender mailSender;

    @Value("${nello.mail.from:nello@example.com}") private String from;
    @Value("${nello.mail.mock:true}") private boolean mock;
    @Value("${nello.cors.allowed-origin:http://localhost:5173}") private String frontendOrigin;

    /** Returns the raw token in mock/dev mode so the caller can forward it; returns null in production. */
    public String sendMagicLink(String to, String token) {
        String link = frontendOrigin + "/auth/callback?token=" + token;
        if (mock) {
            log.info("MOCK MAGIC LINK for {}: {}", to, link);
            return token;
        }
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(to);
        msg.setSubject("Your nello login link");
        msg.setText("Click to log in (valid 15 min, one-time use):\n\n" + link);
        mailSender.send(msg);
        return null;
    }
}
