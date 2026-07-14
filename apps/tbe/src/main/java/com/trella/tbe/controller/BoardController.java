package com.trella.tbe.controller;

import com.trella.tbe.dto.*;
import com.trella.tbe.service.BoardService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class BoardController {

    private final BoardService service;

    public BoardController(BoardService service) {
        this.service = service;
    }

    @GetMapping("/lists")
    public BoardResponse getLists() {
        return service.getAllLists();
    }

    @PostMapping("/lists")
    @ResponseStatus(HttpStatus.CREATED)
    public ListDto createList(@Valid @RequestBody CreateListRequest req) {
        return service.createList(req);
    }

    @PutMapping("/lists/{id}")
    public ListDto updateList(@PathVariable String id, @Valid @RequestBody UpdateListRequest req) {
        return service.updateList(id, req);
    }

    @DeleteMapping("/lists/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteList(@PathVariable String id) {
        service.deleteList(id);
    }

    @PostMapping("/lists/{id}/cards")
    @ResponseStatus(HttpStatus.CREATED)
    public CardDto addCard(@PathVariable String id, @Valid @RequestBody CreateCardRequest req) {
        return service.addCard(id, req);
    }

    @PutMapping("/cards/{id}")
    public CardDto updateCard(@PathVariable String id, @Valid @RequestBody UpdateCardRequest req) {
        return service.updateCard(id, req);
    }

    @DeleteMapping("/cards/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCard(@PathVariable String id) {
        service.deleteCard(id);
    }

    @PutMapping("/cards/{id}/move")
    public CardDto moveCard(@PathVariable String id, @Valid @RequestBody MoveCardRequest req) {
        return service.moveCard(id, req);
    }
}
