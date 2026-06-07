package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.AccountRequestDTO;
import com.myManagementSystem.Financial.dto.AccountResponseDTO;
import com.myManagementSystem.Financial.dto.AccountSnapshotResponseDTO;
import com.myManagementSystem.Financial.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/accounts")
public class AccountController {

  private final AccountService accountService;

  @PostMapping
  public ResponseEntity<AccountResponseDTO> createAccount(@Valid @RequestBody AccountRequestDTO accountRequestDTO) {
    return new ResponseEntity<>(accountService.createAccount(accountRequestDTO), HttpStatus.CREATED);
  }

  @GetMapping
  public ResponseEntity<List<AccountResponseDTO>> getAllAccounts() {
    return ResponseEntity.ok(accountService.getAllAccounts());
  }

  @GetMapping("/{id}")
  public ResponseEntity<AccountResponseDTO> getAccountById(@PathVariable Long id) {
    return ResponseEntity.ok(accountService.getAccountById(id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<AccountResponseDTO> updateAccount(@PathVariable Long id, @Valid @RequestBody AccountRequestDTO accountRequestDTO) {
    return ResponseEntity.ok(accountService.updateAccountById(id, accountRequestDTO));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
    accountService.deleteAccountById(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/snapshots/{accountId}")
  public  ResponseEntity<List<AccountSnapshotResponseDTO>> getSnapshots(@PathVariable Long accountId){
    return ResponseEntity.ok(accountService.getSnapshots(accountId));
  }
}
