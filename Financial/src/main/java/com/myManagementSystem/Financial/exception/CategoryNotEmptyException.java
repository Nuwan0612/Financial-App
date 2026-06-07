package com.myManagementSystem.Financial.exception;

import com.myManagementSystem.Financial.dto.conflicts.ConflictResolutionPayloadDTO;

public class CategoryNotEmptyException extends RuntimeException {
  private final ConflictResolutionPayloadDTO conflictPayload;

  public CategoryNotEmptyException(String message, ConflictResolutionPayloadDTO conflictPayload) {
    super(message);
    this.conflictPayload = conflictPayload;
  }

  public ConflictResolutionPayloadDTO getConflictPayload() {
    return conflictPayload;
  }
}
