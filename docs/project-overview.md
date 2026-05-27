# Agriease - Project Overview

**Date:** 2026-05-27
**Type:** Multi-part Full-stack Agricultural Platform
**Architecture:** Service-Oriented Architecture (SOA)

## Executive Summary

Agriease is a comprehensive digital ecosystem designed to empower the agricultural sector. It bridges the gap between farmers, suppliers, and delivery agents by providing a unified platform for e-commerce, equipment rental, AI-driven crop advisory, and efficient logistics management. The system leverages modern web technologies, Spring Boot's robustness, and PyTorch-based AI to deliver a seamless and intelligent experience for all stakeholders.

## Project Classification

- **Repository Type:** Multi-part
- **Project Type(s):** Web, Backend, AI Service
- **Primary Language(s):** Java, JavaScript, Python
- **Architecture Pattern:** Controller-Service-Repository (Spring Boot), Component-based (React), RESTful API Service (Flask)

## Multi-Part Structure

This project consists of 3 distinct parts:

### backend

- **Type:** backend
- **Location:** `Agriease/backend`
- **Purpose:** Core business logic, e-commerce, user management, and payments.
- **Tech Stack:** Spring Boot 4.0.5, Java 17, PostgreSQL, Spring Security (JWT), Razorpay.

### frontend

- **Type:** web
- **Location:** `Agriease/frontend`
- **Purpose:** Interactive UI for farmers, suppliers, and delivery agents.
- **Tech Stack:** React 18, Vite, Material UI (MUI), Leaflet (Maps), Recharts.

### ai-backend

- **Type:** backend
- **Location:** `Agriease/ai-backend/Flask Deployed App`
- **Purpose:** AI-powered plant disease detection.
- **Tech Stack:** Flask, PyTorch (CNN), Numpy, Pandas.

### How Parts Integrate

The **Spring Boot backend** serves as the central hub. The **React frontend** communicates with the backend via RESTful APIs for all business operations. For AI tasks, specifically plant disease detection, the Spring Boot backend makes internal REST calls to the **Flask AI service**. Payments are integrated via **Razorpay**, and third-party services like **WeatherAPI** are used for crop recommendations.

## Technology Stack Summary

### backend Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework| Spring Boot| 4.0.5   |
| Language | Java       | 17      |
| Database | PostgreSQL | Latest  |
| Security | JWT / Spring Security | 0.11.5 |
| Payments | Razorpay   | 1.4.3   |

### frontend Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework| React      | 18.3.1  |
| Build Tool| Vite      | 7.2.4   |
| UI Library| MUI       | 9.0.0   |
| Mapping  | Leaflet    | 1.9.4   |
| State    | React Context / Hooks | - |

### ai-backend Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework| Flask      | 1.1.2   |
| AI Engine| PyTorch (CNN) | 1.8.1   |
| Language | Python     | 3.8+    |

## Key Features

- **E-commerce Marketplace**: Dedicated sections for seeds and tools with full cart and checkout flows.
- **Equipment Rental**: Supplier-managed equipment listings available for farmer rental.
- **AI Plant Disease Detection**: Upload plant images for instant disease identification and treatment suggestions.
- **Crop Advisor**: Intelligent recommendations for optimal crops based on real-time weather data.
- **Delivery Management**: Advanced dashboard for delivery agents including real-time order tracking and route management.
- **Multi-Role Dashboards**: Tailored experiences for Farmers, Suppliers, and Delivery Agents.

## Architecture Highlights

- **Decoupled AI Processing**: Compute-heavy CNN inference is isolated in a Flask service to maintain backend responsiveness.
- **Role-Based Access Control**: Secure multi-role authentication system using JWT.
- **Micro-frontend Ready**: Clean separation between dashboard components allows for modular expansion.
- **Real-time Integrations**: Live weather updates and map-based tracking for deliveries.

## Development Overview

### Prerequisites

- **Java**: JDK 17 or higher.
- **Node.js**: v18.x or higher.
- **Python**: 3.8 or higher.
- **Database**: PostgreSQL (local or cloud).

### Getting Started

1. **Backend**: Configure `application.yml`, run `./mvnw spring-boot:run`.
2. **AI-Backend**: Install `requirements.txt`, run `python app.py`.
3. **Frontend**: Install `npm install`, run `npm run dev`.

### Key Commands

#### backend

- **Install:** `./mvnw install`
- **Dev:** `./mvnw spring-boot:run`

#### frontend

- **Install:** `npm install`
- **Dev:** `npm run dev`

#### ai-backend

- **Install:** `pip install -r requirements.txt`
- **Dev:** `python app.py`

## Repository Structure

The repository follows a clear separation of concerns with `backend`, `frontend`, and `ai-backend` as top-level modules. Additional `admin_scripts` and `scripts` provide utility for database migrations and maintenance.

## Documentation Map

For detailed information, see:

- [index.md](./index.md) - Master documentation index
- [architecture.md](./architecture.md) - Detailed architecture
- [source-tree-analysis.md](./source-tree-analysis.md) - Directory structure
- [development-guide.md](./development-guide.md) - Development workflow

---

_Generated using BMAD Method `document-project` workflow_
