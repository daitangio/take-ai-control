package io.nello.tbe.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User findOrCreate(String email) {
        return userRepository.findByEmail(email)
            .orElseGet(() -> userRepository.save(new User(email)));
    }
}
