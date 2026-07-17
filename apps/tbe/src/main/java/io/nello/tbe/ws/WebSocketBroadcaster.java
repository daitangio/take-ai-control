package io.nello.tbe.ws;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketBroadcaster {

    private final SimpMessagingTemplate template;

    public void send(String boardId, BoardEvent event) {
        template.convertAndSend("/topic/board/" + boardId, event);
    }
}
