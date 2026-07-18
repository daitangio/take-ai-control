package io.nello.tbe.ws;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WebSocketBroadcaster {

    private final SimpMessagingTemplate template;

    public void send(UUID boardId, BoardEvent event) {
        template.convertAndSend("/topic/board/" + boardId, event);
    }
}
