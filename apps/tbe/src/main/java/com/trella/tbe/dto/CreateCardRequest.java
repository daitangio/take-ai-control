package com.trella.tbe.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCardRequest(@NotBlank String text) {}
