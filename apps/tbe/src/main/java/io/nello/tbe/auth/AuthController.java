package io.nello.tbe.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final EmailDomainValidator validator;
    private final TokenService tokenService;
    private final EmailSender emailSender;
    private final UserService userService;
    private final JwtService jwtService;

    record RequestLinkBody(String email) {}
    record VerifyTokenBody(String token) {}
    record TokenResponse(String jwt) {}
    record RequestLinkResponse(String devToken) {}

    @PostMapping("/request-link")
    public ResponseEntity<RequestLinkResponse> requestLink(@RequestBody RequestLinkBody body) {
        if (!validator.isAllowed(body.email())) {
            return ResponseEntity.status(403).build();
        }
        String raw = tokenService.createToken(body.email());
        String devToken = emailSender.sendMagicLink(body.email(), raw);
        return ResponseEntity.ok(new RequestLinkResponse(devToken));
    }

    @PostMapping("/verify-token")
    public ResponseEntity<TokenResponse> verifyToken(@RequestBody VerifyTokenBody body) {
        String email = tokenService.verifyToken(body.token());
        userService.findOrCreate(email);
        String jwt = jwtService.issue(email);
        return ResponseEntity.ok(new TokenResponse(jwt));
    }
}
