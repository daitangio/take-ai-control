package io.nello.tbe.audit;

import org.hibernate.envers.DefaultRevisionEntity;
import org.hibernate.envers.RevisionEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "revinfo")
@RevisionEntity(NelloRevisionListener.class)
@Getter @Setter
public class NelloRevision extends DefaultRevisionEntity {
    private String authorEmail;
}
