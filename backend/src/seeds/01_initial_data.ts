import type { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing entries in reverse dependency order
  await knex('generation_jobs').del();
  await knex('document_templates').del();
  await knex('users').del();

  // 1. Seed Users (ADMIN and PUBLIC)
  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', saltRounds);
  const userPasswordHash = await bcrypt.hash('UserPassword123!', saltRounds);

  const [adminUser] = await knex('users')
    .insert([
      {
        email: 'admin@makeprd.dev',
        password_hash: adminPasswordHash,
        full_name: 'MakePRD Admin',
        role: 'ADMIN',
      },
      {
        email: 'user@makeprd.dev',
        password_hash: userPasswordHash,
        full_name: 'Public Developer',
        role: 'PUBLIC',
      },
    ])
    .returning(['id', 'email', 'role']);

  // 2. Seed Document Templates
  await knex('document_templates').insert([
    {
      template_key: 'PRD_TEMPLATE_V1',
      document_type: 'PRD',
      system_instruction: `You are a Principal Technical Product Manager and Senior Software Architect. 
Your task is to transform unstructured project descriptions into a rigorous, developer-ready Product Requirements Document (PRD).
Rules:
- Strict output: Return ONLY valid, structured Markdown. No conversational preamble, apologies, or meta comments.
- Tone: Highly technical, unambiguous, and architectural.
- Address all sections comprehensively according to the schema template.`,
      schema_template: `## Product Requirements Document (PRD): {PROJECT_NAME}

### 1. System Overview
- **Project Concept**: {DESCRIPTION}
- **Core Objective**: {CORE_OBJECTIVE}
- **Target Audience**: {TARGET_USERS}

### 2. Functional Requirements
{FUNCTIONAL_REQUIREMENTS}

### 3. Workflow Specifications & User Journeys
{WORKFLOW_SPECIFICATIONS}

### 4. Technical Constraints & Architecture
- **Front-end**: {FRONTEND_TECH}
- **Back-end**: {BACKEND_TECH}
- **Database**: {DATABASE_TECH}
- **Architectural Rules**: {CUSTOM_RULES}

### 5. Non-Functional & Security Requirements
{NON_FUNCTIONAL_REQUIREMENTS}`,
      supported_languages: JSON.stringify(['id', 'en']),
      is_active: true,
    },
    {
      template_key: 'ARCH_TEMPLATE_V1',
      document_type: 'SYSTEM_ARCHITECTURE',
      system_instruction: `You are an Elite Enterprise Software Architect. 
Your task is to produce a comprehensive System Architecture Specification enforcing Controller-Service-Repository (CSR) patterns, defensive security, and scalable infrastructure.
Rules:
- Strict output: Raw Markdown only. No conversational fluff.
- Include layer responsibilities, data flow, and database models.`,
      schema_template: `## System Architecture Specification: {PROJECT_NAME}

### 1. Technology Stack & System Overview
- **Architecture Pattern**: Controller-Service-Repository (CSR) with strict dependency boundaries.
- **Tech Stack**: {TECH_STACK}

### 2. Directory & Component Structure
{DIRECTORY_STRUCTURE}

### 3. Layer Specifications & Responsibilities
- **Controller Layer**: HTTP boundary, Zod DTO validation, uniform response serialization.
- **Service Layer**: Domain business logic, orchestration, retry backoff.
- **Repository Layer**: Pure database abstraction, parameterized queries ($1, $2).

### 4. Database & Storage Architecture
{DATABASE_ARCHITECTURE}

### 5. Security & Defensive Programming
- Input Validation (Zod runtime schemas)
- SQL Injection Prevention (Strict parameterized queries)
- HTTP Security (Helmet, CSP, CORS, Rate Limiting)
- Data in-Transit & at-Rest Encryption

### 6. End-to-End Data Flow
{DATA_FLOW}`,
      supported_languages: JSON.stringify(['id', 'en']),
      is_active: true,
    },
    {
      template_key: 'API_SPEC_TEMPLATE_V1',
      document_type: 'API_SPEC',
      system_instruction: `You are a Principal API Architect. 
Your task is to specify a secure, standardized RESTful API v1 specification with precise HTTP semantics, Zod payload schemas, and robust error formats.
Rules:
- Strict output: Raw Markdown only.`,
      schema_template: `## RESTful API Specification (v1): {PROJECT_NAME}

### 1. Standards & Security
- **Base Version**: /api/v1
- **Content-Type**: application/json
- **Security**: X-CSRF-Token validation on state-changing methods, JWT/HttpOnly session auth, Rate Limiting.

### 2. HTTP Status Code Conventions
- 200 OK, 201 Created, 202 Accepted
- 400 Bad Request (Zod Schema Validation Failure)
- 401 Unauthorized, 403 Forbidden, 429 Too Many Requests, 500 Internal Server Error

### 3. Endpoints & Payloads
{ENDPOINT_DEFINITIONS}`,
      supported_languages: JSON.stringify(['id', 'en']),
      is_active: true,
    },
    {
      template_key: 'UI_DESIGN_TEMPLATE_V1',
      document_type: 'UI_DESIGN',
      system_instruction: `You are a Lead Design System Architect. 
Your task is to design a clean, monochromatic and neutral design system specification with Light/Dark mode support, Inter typography, and atomic component guidelines.
Rules:
- Strict output: Raw Markdown only.`,
      schema_template: `## UI & Design System Specification: {PROJECT_NAME}

### 1. Color System (Theme Modes)
- **Monochromatic & Neutral Palette**:
  - Primary Element/Text: Light (#111827), Dark (#F9FAFB)
  - Secondary/Borders: Light (#D1D5DB), Dark (#374151)
  - Accent Color: #2563EB (Subtle Blue)
  - Background: Light (#FFFFFF), Dark (#030712)
- **Transitions**: 300ms ease-in-out smooth transitions.

### 2. Typography Hierarchy
- **Font Family**: Inter (Clean, neutral modern sans-serif)
- **Scale**: H1 (32px), H2 (24px), Body (16px, 1.5 line height), Caption (12px).

### 3. Core Component Specs
- BaseButton (Primary, Secondary, Danger)
- BaseSearch (Left icon, right clear action)
- BasePagination (Prev, Next, Page Indicators)`,
      supported_languages: JSON.stringify(['id', 'en']),
      is_active: true,
    },
  ]);

  console.log(`Seeding completed. Admin created: ${adminUser.email}`);
}

