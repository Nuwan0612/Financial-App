package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.BookRequestDTO;
import com.myManagementSystem.Financial.dto.BookResponseDTO;
import com.myManagementSystem.Financial.service.BookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    // CREATE
    @PostMapping
    public ResponseEntity<BookResponseDTO> createBook(@RequestBody BookRequestDTO requestDTO) {
        log.info("REST request to create a Book");
        BookResponseDTO response = bookService.createBook(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // READ ALL
    @GetMapping
    public ResponseEntity<List<BookResponseDTO>> getAllBooks() {
        log.info("REST request to get all Books");
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    // READ ONE
    @GetMapping("/{id}")
    public ResponseEntity<BookResponseDTO> getBookById(@PathVariable Long id) {
        log.info("REST request to get Book by ID: {}", id);
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<BookResponseDTO> updateBook(
            @PathVariable Long id,
            @RequestBody BookRequestDTO requestDTO) {
        log.info("REST request to update Book by ID: {}", id);
        return ResponseEntity.ok(bookService.updateBookById(id, requestDTO));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        log.info("REST request to delete Book by ID: {}", id);
        bookService.deleteBookById(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
