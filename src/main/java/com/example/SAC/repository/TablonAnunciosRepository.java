package com.example.SAC.repository;

import com.example.SAC.entity.TablonAnuncios;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TablonAnunciosRepository extends JpaRepository<TablonAnuncios, Integer> {
}
