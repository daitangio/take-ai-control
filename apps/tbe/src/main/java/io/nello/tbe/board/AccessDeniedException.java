package io.nello.tbe.board;

public class AccessDeniedException extends RuntimeException {
    public AccessDeniedException(String msg) { super(msg); }
}
