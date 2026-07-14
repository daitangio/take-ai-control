package com.trella.tbe.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateListRequest(@NotBlank String title) {}
