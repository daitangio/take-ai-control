package io.nello.tbe.ws;

public record BoardEvent(String type, String entityType, Object payload) {}
