package io.nello.tbe.card;

import io.nello.tbe.list.BoardList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, String> {
    List<Card> findByListOrderByPosition(BoardList list);
    @Query("SELECT COALESCE(MAX(c.position), 0) FROM Card c WHERE c.list = :list")
    int findMaxPositionByList(BoardList list);
}
