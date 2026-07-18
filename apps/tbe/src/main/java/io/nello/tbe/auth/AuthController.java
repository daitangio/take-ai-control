package io.nello.tbe.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final EmailDomainValidator emailDomainValidator;
    private final TokenService tokenService;
    private final EmailSender emailSender;
    private final JwtService jwtService;
    private final UserService userService;

    @PostMapping("/request-link")
    public ResponseEntity<Map<String, String>> requestLink(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "email required"));
        }
        if (!emailDomainValidator.isAllowed(email)) {
            return ResponseEntity.status(403).body(Map.of("error", "Email domain not allowed"));
        }
        String rawToken = tokenService.createToken(email);
        String mockToken = emailSender.sendMagicLink(email, rawToken);
        // In mock mode return token so the frontend can redirect immediately
        if (mockToken != null) {
            return ResponseEntity.ok(Map.of("mockToken", mockToken));
        }
        return ResponseEntity.ok(Map.of("message", "Check your email"));
    }

    @PostMapping("/verify-token")
    public ResponseEntity<Map<String, String>> verifyToken(@RequestBody Map<String, String> body) {
        String rawToken = body.get("token");
        if (rawToken == null || rawToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "token required"));
        }
        try {
            String email = tokenService.verifyToken(rawToken);
            userService.findOrCreate(email);
            String jwt = jwtService.issue(email);
            return ResponseEntity.ok(Map.of("jwt", jwt, "email", email));
        } catch (InvalidTokenException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }
}
