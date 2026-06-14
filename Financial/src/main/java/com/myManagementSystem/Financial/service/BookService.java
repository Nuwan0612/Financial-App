package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.BookRequestDTO;
import com.myManagementSystem.Financial.dto.BookResponseDTO;
import com.myManagementSystem.Financial.entity.Book;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.BookRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class BookService {
    
    private final BookRepository bookRepository;

    // CREATE
    public BookResponseDTO createBook(BookRequestDTO BookRequestDTO) {
        log.info("Attempting to create new Book {}", BookRequestDTO.name());

        Book book = Book.builder()
                .name(BookRequestDTO.name())
                .build();

        Book savedBook = bookRepository.save(book);
        log.info("Successfully saved Book with ID {}", savedBook.getId());
        return mapToDTO(savedBook);
    }

    // READ ALL
    public List<BookResponseDTO> getAllBooks() {
        log.info("Attempting to get all Books from database");

        List<BookResponseDTO> books = bookRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();

        log.debug("Successfully retrieved {} Books", books.size());
        return books;
    }

    // READ ONE
    public BookResponseDTO getBookById(Long id) {
        log.info("Attempting to get Book by ID {}", id);
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Book with ID {} not found", id);
                    return new ResourceNotFoundException("Book with ID " + id + " not found");
                });
        return mapToDTO(book);
    }

    // UPDATE
    public BookResponseDTO updateBookById(Long id,  BookRequestDTO bookRequestDTO) {
        log.info("Attempting to update Book by ID {}", id);
        Book existingBook = bookRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Update failed. Book not found with ID: {}", id);
                    return new ResourceNotFoundException("Book with ID " + id + " not found");
                });

        log.debug("Updating Book {}.", existingBook.getName());

        existingBook.setName(bookRequestDTO.name());

        Book updatedBook = bookRepository.save(existingBook);
        log.info("Successfully updated Book with ID: {}", id);

        return mapToDTO(updatedBook);
    }

    public void deleteBookById(Long id) {
        log.info("Attempting to delete Book by ID {}", id);

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book with ID " + id + " not found"));

        bookRepository.delete(book);
        log.info("Successfully deleted Book with ID: {}", id);
    }

    // Helper Method
    private BookResponseDTO mapToDTO(Book book) {
        return new BookResponseDTO(
                book.getId(),
                book.getName()
        );
    }
}
