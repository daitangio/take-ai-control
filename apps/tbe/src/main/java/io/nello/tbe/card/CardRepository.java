package io.nello.tbe.card;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CardRepository extends JpaRepository<Card, UUID> {
    List<Card> findByListIdOrderByPosition(UUID listId);

    @Query("SELECT COALESCE(MAX(c.position), 0) FROM Card c WHERE c.list.id = :listId")
    int findMaxPosition(@Param("listId") UUID listId);

    Optional<Card> findByIdAndListId(UUID id, UUID listId);

    List<Card> findByListIdOrderByPositionAsc(UUID listId);
}
