# Agriease Frontend - Architecture

**Date:** 2026-05-27

## Executive Summary

The Agriease frontend is a modern React 18 application built with Vite. It provides a highly interactive and role-specific user experience, featuring dashboards for farmers, suppliers, and delivery agents. The UI is designed for productivity, with integrated mapping, charting, and AI tools.

## Technology Stack

- **Framework**: React 18.3.1
- **Build Tool**: Vite 7.2.4
- **UI Library**: Material UI (MUI) 9.0.0
- **Routing**: React Router Dom 7.13.0
- **Styling**: MUI System / Emotion
- **Charts**: Recharts 3.8.1
- **Maps**: Leaflet / React-Leaflet 4.2.1

## Architecture Pattern: Component-Based SPA

The application is structured around role-based page hierarchies and reusable UI components:

1.  **Dashboard Layouts**: Reusable wrappers (`DashboardLayout.jsx`) that provide navigation and role-specific sidebars.
2.  **Page Components**: Views located in `src/pages/` (e.g., `FarmerDashboard.jsx`, `DeliveryAgentDashboard.jsx`).
3.  **UI Components**: Atomic and molecular components in `src/components/ui/`.
4.  **API Layer**: Centrally managed Axios instances in `src/api/` for consistent backend communication.

## Key Features & UI Logic

### Farmer Tools
- **Market & Tools**: Catalog views with search and filtering for agricultural products.
- **Crop Advisor**: Interactive UI for receiving AI-driven crop recommendations.
- **Disease Detector**: Image upload interface for the AI plant disease detection engine.
- **Land Measurement**: Integrated mapping tools for calculating field areas.

### Supplier Management
- **Product/Equipment Management**: Forms and tables for managing inventory.
- **Order Processing**: Detailed views for managing sales to farmers.

### Delivery Logistics
- **Agent Dashboard**: Real-time tracking of assigned orders with map integration and status updates.

## State Management

- **React Context**: Used for global state such as Authentication and Notifications.
- **React Hooks**: Extensive use of `useState` and `useEffect` for local component state and data fetching.
- **React Router State**: Used for passing context between related views (e.g., from checkout to payment).

## User Flow & Routing

- **Auth Guard**: Unauthenticated users are redirected to the Login page.
- **Role Routing**: After login, users are automatically directed to their respective role dashboard (Farmer, Supplier, or Agent).
- **Nested Routes**: Dashboards use nested routing to switch between sub-features while maintaining the sidebar context.

## Integration

- **Backend API**: All dynamic data is fetched from the Spring Boot backend.
- **AI Service**: The frontend interacts with AI features through the backend's orchestrator endpoints.
- **Third-party Widgets**: Integrated Weather widgets and interactive maps.

---

_Generated using BMAD Method `document-project` workflow_
