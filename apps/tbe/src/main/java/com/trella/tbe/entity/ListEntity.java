package com.trella.tbe.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tbe_list")
public class ListEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private int position;

    @OneToMany(mappedBy = "list", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("position ASC")
    private List<CardEntity> cards = new ArrayList<>();

    public ListEntity() {}

    public ListEntity(String id, String title, int position) {
        this.id = id;
        this.title = title;
        this.position = position;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }

    public List<CardEntity> getCards() { return cards; }
    public void setCards(List<CardEntity> cards) { this.cards = cards; }
}
