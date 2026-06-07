package com.myManagementSystem.Financial.exception;

import com.myManagementSystem.Financial.dto.conflicts.MainCategoryConflictResolutionPayloadDTO;

public class MainCategoryNotEmptyException extends RuntimeException {
  private final MainCategoryConflictResolutionPayloadDTO payload;

  public MainCategoryNotEmptyException(String message, MainCategoryConflictResolutionPayloadDTO payload) {
    super(message);
    this.payload = payload;
  }

  public MainCategoryConflictResolutionPayloadDTO getPayload() {
    return payload;
  }
}
