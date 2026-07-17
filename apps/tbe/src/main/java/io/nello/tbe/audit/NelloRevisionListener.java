package io.nello.tbe.audit;

import org.hibernate.envers.RevisionListener;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class NelloRevisionListener implements RevisionListener {

    @Override
    public void newRevision(Object revisionEntity) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            ((NelloRevision) revisionEntity).setAuthorEmail(auth.getName());
        }
    }
}
