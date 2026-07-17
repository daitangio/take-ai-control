package io.nello.tbe.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repo;

    @Transactional
    public User findOrCreate(String email) {
        return repo.findByEmail(email).orElseGet(() -> repo.save(User.of(email)));
    }

    public User getByEmail(String email) {
        return repo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }
}
