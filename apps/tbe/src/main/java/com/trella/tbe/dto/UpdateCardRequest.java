package com.trella.tbe.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateCardRequest(@NotBlank String text) {}
