package com.myManagementSystem.Financial.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<Map<String, String>> handleNotFound(ResourceNotFoundException ex) {
    log.warn("Attempted to access missing resource: {}", ex.getMessage());

    Map<String, String> errorResponse = new HashMap<>();
    errorResponse.put("message", ex.getMessage());
    return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {

    String message = ex.getRootCause() != null
        ? ex.getRootCause().getMessage()
        : ex.getMessage();

    // Unique constraint
    if (message != null && message.contains("unique") || message.contains("duplicate")) {
      return ResponseEntity.status(HttpStatus.CONFLICT)
          .body(Map.of("error", "A record with this exact name already exists."));
    }

    // Not-null constraint
    if (message != null && message.contains("not-null") || message.contains("null value")) {
      return ResponseEntity.status(HttpStatus.CONFLICT)
          .body(Map.of("error", "A required field is null: " + message));
    }

    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(Map.of("error", "Database constraint violation: " + message));
  }

  @ExceptionHandler(CategoryNotEmptyException.class)
  public ResponseEntity<Map<String, Object>> handleCategoryNotEmpty(CategoryNotEmptyException ex) {
    Map<String, Object> response = new HashMap<>();
    response.put("status", HttpStatus.CONFLICT.value());
    response.put("error", "Category Not Empty");
    response.put("message", ex.getMessage());
    response.put("resolutionData", ex.getConflictPayload()); // The new massive payload!

    return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
  }

  @ExceptionHandler(MainCategoryNotEmptyException.class)
  public ResponseEntity<Map<String, Object>> handleMainCategoryNotEmpty(
      MainCategoryNotEmptyException ex) {

    Map<String, Object> body = new HashMap<>();
    body.put("error", "Main Category Not Empty");
    body.put("message", ex.getMessage());
    body.put("status", 409);
    body.put("resolutionData", ex.getPayload());

    return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
  }

  @ExceptionHandler(InsufficientFundsException.class)
  public ResponseEntity<Map<String, String>> handleInsufficientFunds(InsufficientFundsException ex) {
    Map<String, String> response = new HashMap<>();
    response.put("error", "Insufficient Funds");
    response.put("message", ex.getMessage());
    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
  }
}
