package com.myManagementSystem.Financial.repository;

import com.myManagementSystem.Financial.entity.BookNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookNotesRepository extends JpaRepository<BookNote, Long> {
    List<BookNote> findByBookId(Long bookId);
}
