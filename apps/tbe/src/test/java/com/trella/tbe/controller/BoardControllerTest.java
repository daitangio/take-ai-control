package com.trella.tbe.controller;

import com.trella.tbe.dto.*;
import com.trella.tbe.service.BoardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class BoardControllerTest {

    @Autowired WebApplicationContext context;
    @MockitoBean BoardService service;

    private MockMvc mvc;

    private MockMvc mvc() {
        if (mvc == null) {
            mvc = MockMvcBuilders.webAppContextSetup(context)
                    .apply(springSecurity())
                    .build();
        }
        return mvc;
    }

    @Test
    void getLists_unauthorized() throws Exception {
        mvc().perform(get("/api/lists"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getLists_authorized() throws Exception {
        when(service.getAllLists()).thenReturn(new BoardResponse(List.of()));
        mvc().perform(get("/api/lists")
                        .with(httpBasic("testuser", "testpass")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lists").isArray());
    }

    @Test
    void createList() throws Exception {
        var dto = new ListDto("l1", "To Do", List.of());
        when(service.createList(any())).thenReturn(dto);

        mvc().perform(post("/api/lists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"To Do\"}")
                        .with(httpBasic("testuser", "testpass")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("To Do"));
    }

    @Test
    void createList_emptyTitle() throws Exception {
        mvc().perform(post("/api/lists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"\"}")
                        .with(httpBasic("testuser", "testpass")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateList() throws Exception {
        var dto = new ListDto("l1", "Done", List.of());
        when(service.updateList(eq("l1"), any())).thenReturn(dto);

        mvc().perform(put("/api/lists/l1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Done\"}")
                        .with(httpBasic("testuser", "testpass")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Done"));
    }

    @Test
    void deleteList() throws Exception {
        mvc().perform(delete("/api/lists/l1")
                        .with(httpBasic("testuser", "testpass")))
                .andExpect(status().isNoContent());
    }

    @Test
    void addCard() throws Exception {
        var dto = new CardDto("c1", "Hello");
        when(service.addCard(eq("l1"), any())).thenReturn(dto);

        mvc().perform(post("/api/lists/l1/cards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"Hello\"}")
                        .with(httpBasic("testuser", "testpass")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.text").value("Hello"));
    }

    @Test
    void updateCard() throws Exception {
        var dto = new CardDto("c1", "Updated");
        when(service.updateCard(eq("c1"), any())).thenReturn(dto);

        mvc().perform(put("/api/cards/c1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"Updated\"}")
                        .with(httpBasic("testuser", "testpass")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.text").value("Updated"));
    }

    @Test
    void deleteCard() throws Exception {
        mvc().perform(delete("/api/cards/c1")
                        .with(httpBasic("testuser", "testpass")))
                .andExpect(status().isNoContent());
    }

    @Test
    void moveCard() throws Exception {
        var dto = new CardDto("c1", "Hello");
        when(service.moveCard(eq("c1"), any())).thenReturn(dto);

        mvc().perform(put("/api/cards/c1/move")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"targetListId\":\"l2\",\"position\":0}")
                        .with(httpBasic("testuser", "testpass")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.text").value("Hello"));
    }

    @Test
    void moveCard_invalidPosition() throws Exception {
        mvc().perform(put("/api/cards/c1/move")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"targetListId\":\"l2\",\"position\":-1}")
                        .with(httpBasic("testuser", "testpass")))
                .andExpect(status().isBadRequest());
    }
}
