package io.nello.tbe.auth;

public class InvalidTokenException extends RuntimeException {
    public InvalidTokenException(String msg) { super(msg); }
}
