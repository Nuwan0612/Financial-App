package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.BookNotesRequestDTO;
import com.myManagementSystem.Financial.dto.BookNotesResponseDTO;
import com.myManagementSystem.Financial.entity.Book;
import com.myManagementSystem.Financial.entity.BookNote;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.BookNotesRepository;
import com.myManagementSystem.Financial.repository.BookRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class BookNotesService {

    private final BookNotesRepository bookNoteRepository;
    private final BookRepository bookRepository;

    // CREATE
    public BookNotesResponseDTO createBookNote(BookNotesRequestDTO requestDTO) {
        log.info("Attempting to create new BookNote for Book ID {}", requestDTO.bookId());

        Book book = bookRepository.findById(requestDTO.bookId())
                .orElseThrow(() -> {
                    log.warn("Book with ID {} not found", requestDTO.bookId());
                    return new ResourceNotFoundException("Book with ID " + requestDTO.bookId() + " not found");
                });

        BookNote bookNote = BookNote.builder()
                .chapter(requestDTO.chapter())
                .notes(requestDTO.notes())
                .dateTime(LocalDateTime.now()) // Set automatically on creation
                .book(book)
                .build();

        BookNote savedNote = bookNoteRepository.save(bookNote);
        log.info("Successfully saved BookNote with ID {}", savedNote.getId());

        return mapToDTO(savedNote);
    }

    // READ ALL
    public List<BookNotesResponseDTO> getAllBookNotes() {
        log.info("Attempting to get all BookNotes from database");

        List<BookNotesResponseDTO> notes = bookNoteRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();

        log.debug("Successfully retrieved {} BookNotes", notes.size());
        return notes;
    }

    // READ ONE
    public BookNotesResponseDTO getBookNoteById(Long id) {
        log.info("Attempting to get BookNote by ID {}", id);

        BookNote bookNote = bookNoteRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("BookNote with ID {} not found", id);
                    return new ResourceNotFoundException("BookNote with ID " + id + " not found");
                });

        return mapToDTO(bookNote);
    }

    // READ ALL BY BOOK ID
    public List<BookNotesResponseDTO> getBookNotesByBookId(Long bookId) {
        log.info("Attempting to get all BookNotes for Book ID {}", bookId);

        // Optional: You could inject BookRepository here to check if the book actually exists first
        // and throw a ResourceNotFoundException if it doesn't.
        // However, simply returning an empty list for a book with no notes is standard practice.

        List<BookNotesResponseDTO> notes = bookNoteRepository.findByBookId(bookId)
                .stream()
                .map(this::mapToDTO)
                .toList();

        log.debug("Successfully retrieved {} BookNotes for Book ID {}", notes.size(), bookId);
        return notes;
    }

    // UPDATE
    public BookNotesResponseDTO updateBookNoteById(Long id, BookNotesRequestDTO requestDTO) {
        log.info("Attempting to update BookNote by ID {}", id);

        BookNote existingNote = bookNoteRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Update failed. BookNote not found with ID: {}", id);
                    return new ResourceNotFoundException("BookNote with ID " + id + " not found");
                });

        log.debug("Updating BookNote ID {}.", existingNote.getId());

        existingNote.setChapter(requestDTO.chapter());
        existingNote.setNotes(requestDTO.notes());
        // Note: dateTime is usually left alone during updates to preserve creation time.
        // bookId is also left alone, assuming a note doesn't move between books.

        BookNote updatedNote = bookNoteRepository.save(existingNote);
        log.info("Successfully updated BookNote with ID: {}", id);

        return mapToDTO(updatedNote);
    }

    // DELETE
    public void deleteBookNoteById(Long id) {
        log.info("Attempting to delete BookNote by ID {}", id);

        BookNote bookNote = bookNoteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BookNote with ID " + id + " not found"));

        bookNoteRepository.delete(bookNote);
        log.info("Successfully deleted BookNote with ID: {}", id);
    }

    // Helper Method
    private BookNotesResponseDTO mapToDTO(BookNote bookNote) {
        return new BookNotesResponseDTO(
                bookNote.getId(),
                bookNote.getChapter(),
                bookNote.getNotes(),
                bookNote.getDateTime(),
                bookNote.getBook().getId()
        );
    }

}
