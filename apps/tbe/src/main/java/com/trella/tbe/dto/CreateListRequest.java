package com.trella.tbe.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateListRequest(@NotBlank String title) {}
