package com.myManagementSystem.Financial.repository;

import com.myManagementSystem.Financial.dto.DailyWealthSnapshotResponseDTO;
import com.myManagementSystem.Financial.entity.AccountSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountSnapshotRepository extends JpaRepository<AccountSnapshot, Long> {
  List<AccountSnapshot> findByAccountId(Long accountId);

  @Query("""
      SELECT new com.myManagementSystem.Financial.dto.DailyWealthSnapshotResponseDTO(
          CAST(s.snapshotDate AS LocalDate),
          SUM(s.balance)
      )
      FROM AccountSnapshot s
      GROUP BY CAST(s.snapshotDate AS LocalDate)
      ORDER BY CAST(s.snapshotDate AS LocalDate) ASC
  """)
  List<DailyWealthSnapshotResponseDTO> findTotalWealthHistory();
}
