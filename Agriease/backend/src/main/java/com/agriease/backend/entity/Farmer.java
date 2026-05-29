package com.agriease.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "farmers")
public class Farmer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "farm_size")
    private String farmSize;

    @Column(name = "crop_types", columnDefinition = "TEXT")
    private String cropTypes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }
    public String getFarmSize() {
        return farmSize;
    }
    public void setFarmSize(String farmSize) {
        this.farmSize = farmSize;
    }
    public String getCropTypes() {
        return cropTypes;
    }
    public void setCropTypes(String cropTypes) {
        this.cropTypes = cropTypes;
    }
}