package com.trella.tbe.repository;

import com.trella.tbe.entity.ListEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ListRepository extends JpaRepository<ListEntity, String> {

    @EntityGraph(attributePaths = "cards")
    List<ListEntity> findAllByOrderByPositionAsc();
}
