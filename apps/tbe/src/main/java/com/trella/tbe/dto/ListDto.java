package com.trella.tbe.dto;

import java.util.List;

public record ListDto(String id, String title, List<CardDto> cards) {}
