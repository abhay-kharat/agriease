# Agriease - Source Tree Analysis

**Date:** 2026-05-27

## Overview

The Agriease project is structured as a multi-part monorepo, separating concerns between the core business logic (backend), the user interface (frontend), and the intelligent analysis engine (ai-backend).

## Multi-Part Structure

This project is organized into 3 distinct parts:

- **backend** (`Agriease/backend`): Spring Boot application handling core business logic, persistence, and security.
- **frontend** (`Agriease/frontend`): React-based single-page application (SPA) providing the user interface for all roles.
- **ai-backend** (`Agriease/ai-backend/Flask Deployed App`): Python Flask service dedicated to running CNN-based image classification for plant diseases.

## Complete Directory Structure

```
Agriease/
├── backend/                # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/agriease/backend/
│   │   │   │   ├── controller/     # REST API Endpoints
│   │   │   │   ├── entity/         # JPA Entities (Database Schema)
│   │   │   │   ├── repository/     # Data Access Layer
│   │   │   │   ├── service/        # Business Logic & Integrations
│   │   │   │   └── security/       # JWT & Auth Configuration
│   │   │   └── resources/
│   │   │       ├── application.yml # Main Configuration
│   │   │       └── schema.sql      # Database Initial Schema
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI & Dashboard Components
│   │   ├── pages/          # Route-based View Components
│   │   │   ├── farmer/     # Farmer Dashboard & Tools
│   │   │   ├── supplier/   # Supplier Management Pages
│   │   │   └── agent/      # Delivery Agent Logistics UI
│   │   ├── api/            # API Client Wrappers (Axios)
│   │   ├── assets/         # Static Assets & Styles
│   │   └── App.jsx         # Main Routing & Layout Setup
├── ai-backend/             # Python AI Service
│   └── Flask Deployed App/
│       ├── app.py          # Flask Server & Prediction API
│       ├── CNN.py          # Model Definition
│       ├── static/         # Image Upload Storage
│       └── plant_disease_model_1_latest.pt # Pre-trained Weights
└── docs/                   # Project Documentation
```

## Critical Directories

### `Agriease/backend/src/main/java/com/agriease/backend/controller`

**Purpose:** Defines the RESTful API surface area for the entire system.
**Contains:** Controllers for Auth, Products, Orders, Payments, and AI Disease analysis.
**Entry Points:** `AuthController.java`, `ProductController.java`, `DiseaseController.java`.

### `Agriease/frontend/src/pages`

**Purpose:** Contains the top-level page components organized by user role.
**Contains:** Dashboards for Farmers, Suppliers, and Delivery Agents.
**Entry Points:** `FarmerDashboard.jsx`, `SupplierDashboard.jsx`, `DeliveryAgentDashboard.jsx`.

### `Agriease/ai-backend/Flask Deployed App`

**Purpose:** Isolated service for compute-intensive AI inference.
**Contains:** Flask app, CNN model, and pre-trained weights.
**Entry Points:** `app.py`.

## Part-Specific Trees

### backend Structure

```
backend/
├── src/main/java/com/agriease/backend/
│   ├── controller/
│   ├── entity/
│   ├── repository/
│   └── service/
├── pom.xml
└── HELP.md
```

**Key Directories:**
- **`src/main/java/com/agriease/backend/entity`**: Defines the data structure for users, products, orders, and AI reports.
- **`src/main/java/com/agriease/backend/service`**: Contains the core logic for Razorpay payments, weather-based advice, and AI service calls.

### frontend Structure

```
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── api/
├── package.json
└── vite.config.js
```

**Key Directories:**
- **`src/pages/farmer`**: Tools for crop advisory, market access, and land measurement.
- **`src/pages/agent`**: Real-time delivery tracking and status management.

## Integration Points

### backend → ai-backend

- **Location:** `Agriease/backend/src/main/java/com/agriease/backend/service/DiseaseService.java`
- **Type:** REST API (JSON)
- **Details:** Calls Flask `/predict-by-path` with the image path.

### frontend → backend

- **Location:** `Agriease/frontend/src/api/`
- **Type:** REST API (JSON)
- **Details:** Communicates with Spring Boot for all CRUD and business operations.

## Entry Points

### backend

- **Entry Point:** `Agriease/backend/src/main/java/com/agriease/backend/BackendApplication.java`
- **Bootstrap:** Standard Spring Boot main class annotated with `@SpringBootApplication`.

### frontend

- **Entry Point:** `Agriease/frontend/src/main.jsx`
- **Bootstrap:** React root mounting with `BrowserRouter`.

### ai-backend

- **Entry Point:** `Agriease/ai-backend/Flask Deployed App/app.py`
- **Bootstrap:** Flask development server entry.

---

_Generated using BMAD Method `document-project` workflow_
