package io.nello.tbe.audit;

import org.hibernate.envers.RevisionEntity;
import org.hibernate.envers.RevisionNumber;
import org.hibernate.envers.RevisionTimestamp;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "revinfo")
@RevisionEntity(NelloRevisionListener.class)
@Getter @Setter
public class NelloRevision {
    @Id @GeneratedValue @RevisionNumber
    private int id;
    @RevisionTimestamp
    private long timestamp;
    private String authorEmail;
}
