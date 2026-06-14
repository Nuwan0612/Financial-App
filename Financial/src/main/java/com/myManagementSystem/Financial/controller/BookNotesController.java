package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.BookNotesRequestDTO;
import com.myManagementSystem.Financial.dto.BookNotesResponseDTO;
import com.myManagementSystem.Financial.service.BookNotesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/book-notes")
@RequiredArgsConstructor
public class BookNotesController {
    private final BookNotesService bookNotesService;

    // CREATE
    @PostMapping
    public ResponseEntity<BookNotesResponseDTO> createBookNote(@RequestBody BookNotesRequestDTO requestDTO) {
        log.info("REST request to create a BookNote");
        BookNotesResponseDTO response = bookNotesService.createBookNote(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // READ ALL
    @GetMapping
    public ResponseEntity<List<BookNotesResponseDTO>> getAllBookNotes() {
        log.info("REST request to get all BookNotes");
        return ResponseEntity.ok(bookNotesService.getAllBookNotes());
    }

    // READ ALL BY BOOK ID
    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<BookNotesResponseDTO>> getBookNotesByBookId(@PathVariable Long bookId) {
        log.info("REST request to get all BookNotes for Book ID: {}", bookId);
        return ResponseEntity.ok(bookNotesService.getBookNotesByBookId(bookId));
    }

    // READ ONE
    @GetMapping("/{id}")
    public ResponseEntity<BookNotesResponseDTO> getBookNoteById(@PathVariable Long id) {
        log.info("REST request to get BookNote by ID: {}", id);
        return ResponseEntity.ok(bookNotesService.getBookNoteById(id));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<BookNotesResponseDTO> updateBookNote(
            @PathVariable Long id,
            @RequestBody BookNotesRequestDTO requestDTO) {
        log.info("REST request to update BookNote by ID: {}", id);
        return ResponseEntity.ok(bookNotesService.updateBookNoteById(id, requestDTO));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBookNote(@PathVariable Long id) {
        log.info("REST request to delete BookNote by ID: {}", id);
        bookNotesService.deleteBookNoteById(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
