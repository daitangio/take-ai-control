package com.trella.tbe.repository;

import com.trella.tbe.entity.CardEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CardRepository extends JpaRepository<CardEntity, String> {

    List<CardEntity> findByListIdOrderByPositionAsc(String listId);

    int countByListId(String listId);
}
