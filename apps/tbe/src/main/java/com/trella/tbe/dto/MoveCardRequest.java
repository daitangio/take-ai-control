package com.trella.tbe.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record MoveCardRequest(@NotBlank String targetListId, @Min(0) int position) {}
