package com.trella.tbe.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tbe_card")
public class CardEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String text;

    @Column(nullable = false)
    private int position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", nullable = false)
    private ListEntity list;

    public CardEntity() {}

    public CardEntity(String id, String text, int position, ListEntity list) {
        this.id = id;
        this.text = text;
        this.position = position;
        this.list = list;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }

    public ListEntity getList() { return list; }
    public void setList(ListEntity list) { this.list = list; }
}
