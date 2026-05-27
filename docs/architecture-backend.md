# Agriease Backend - Architecture

**Date:** 2026-05-27

## Executive Summary

The backend of Agriease is built on Spring Boot 4.x, providing a robust and secure foundation for the platform's multi-role ecosystem. It handles authentication, e-commerce logic, payment processing, and serves as an orchestrator for external services including AI and weather data.

## Technology Stack

- **Framework**: Spring Boot 4.0.5
- **Language**: Java 17
- **Database**: PostgreSQL (Hosted on Supabase)
- **Security**: JWT (Stateless Authentication)
- **Build Tool**: Maven

## Architecture Pattern: Controller-Service-Repository

The application follows a standard layered architecture:

1.  **Controller Layer**: Exposes REST endpoints (`/auth`, `/products`, `/orders`, `/disease`, etc.).
2.  **Service Layer**: Encapsulates business logic and orchestrates third-party integrations (Razorpay, Cloudinary, AI Service).
3.  **Repository Layer**: Uses Spring Data JPA for type-safe database access.
4.  **Entity Layer**: Represents the database schema as JPA entities.

## Key Integrations

### Payment Gateway (Razorpay)
- **Service**: `RazorpayService.java`
- **Purpose**: Handles order creation and payment verification.
- **Flow**: Frontend requests order → Backend creates Razorpay order → Frontend completes payment → Backend verifies signature and updates status.

### AI Disease Detection
- **Service**: `DiseaseService.java`
- **Purpose**: Bridges the backend and the Flask AI service.
- **Flow**: Image upload → Backend saves path → Backend calls Flask `/predict-by-path` → Results saved to `PlantDiseaseReport` entity.

### Crop Advisory (WeatherAPI)
- **Service**: `CropAdvisorService.java`
- **Purpose**: Generates dynamic crop recommendations based on location-specific weather data.

### Image Management (Cloudinary)
- **Usage**: Used primarily for delivery agent proof-of-delivery uploads.

## Data Architecture

The system uses a relational schema managed via Hibernate:
- **User/UserRole**: Multi-role support (FARMER, SUPPLIER, DELIVERY_AGENT).
- **Product/Equipment**: Listings for sale or rent.
- **Order/OrderItem**: E-commerce transaction records.
- **Payment**: Tracking transaction status and Razorpay IDs.
- **PlantDiseaseReport**: History of AI analysis for farmers.

## Security

- **JWT Authentication**: Secured via a custom `JwtFilter` and `SecurityConfig`.
- **Stateless Session**: No server-side session state is maintained.
- **Role-Based Access**: Controllers are protected by role-specific annotations (e.g., `PreAuthorize`).

## Development & Deployment

- **Prerequisites**: JDK 17, Maven.
- **Local Dev**: Use `application.properties` with a local PostgreSQL or the provided Supabase connection.
- **Bootstrap**: Run `./mvnw spring-boot:run`.

---

_Generated using BMAD Method `document-project` workflow_
