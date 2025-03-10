package com.example.SAC.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.SAC.entity.AreaComun;
import org.springframework.stereotype.Repository;

@Repository
public interface AreaComunRepository extends JpaRepository<AreaComun, Integer> {
}
