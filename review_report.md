# Code Review Report - Epic 1

## Story 1.2: Expanded User Registration API

### Security
- **[Blind Hunter] Unauthenticated Data Tampering (Account Takeover)**: In `AuthService.register()`, if the provided email already exists, the system attempts to append the new role to the existing user and updates their profile details (username, phone, address, photo, etc.). This happens *without* verifying the password. An attacker can overwrite the personal information of any existing user just by knowing their email address.

### Missing AC
- **[Acceptance Auditor] Missing Email Uniqueness Validation**: The Acceptance Criteria explicitly demands validation for a "unique email". Due to the flawed existing user branch, duplicate emails are not rejected; instead, they trigger the unauthenticated update branch. 

### Edge Case
- **[Edge Case Hunter] Empty Role Profiles**: `ensureFarmerProfile` and `ensureSupplierProfile` create role-specific records in the database, but they insert entirely empty rows (except for the user relation). They do not attempt to map or require any role-specific data.

## Story 1.3: Delivery Agent Vehicle Selection

### Bug
- **[Blind Hunter] Missing Backend Required Validation**: The backend does not enforce that a `DELIVERY_AGENT` must provide at least one vehicle type. It relies solely on the frontend, meaning direct API requests can create delivery agents with null or empty vehicle capabilities.

### Edge Case
- **[Edge Case Hunter] Inconsistent Casing Persistence**: `AuthService.ensureDeliveryAgentProfile()` validates vehicle types by converting them to uppercase, but it persists the *original* unformatted strings (e.g., `String.join(", ", request.getVehicleTypes())`). This will pollute the database with inconsistently cased values (e.g., "Bike, van").
- **[Edge Case Hunter] Duplicate Vehicle Types**: The backend does not deduplicate the `vehicleTypes` array. A request containing `["BIKE", "BIKE"]` will bypass validation and be saved verbatim as `"BIKE, BIKE"`.

## Story 1.4: Enhanced Security with Refresh Tokens

### Bug
- **[Blind Hunter] TransactionRequiredException on Login (Critical)**: `AuthService.login()` and `AuthService.switchRole()` both call `createRefreshToken()`, which executes `refreshTokenRepository.deleteByUser(user)`. Because `deleteByUser` is a `@Modifying` Spring Data JPA query, it requires an active transaction. Since neither `login()` nor `switchRole()` is annotated with `@Transactional`, attempting to log in will crash the application with a `TransactionRequiredException`.

### Security
- **[Blind Hunter] Plaintext Refresh Tokens**: The `RefreshToken` entity stores the refresh tokens in plaintext in the database. In the event of a database breach, all active refresh tokens would be exposed. Tokens should be hashed (e.g., SHA-256) at rest.

## Story 1.5: Multi-Step Registration UI

### Missing AC
- **[Acceptance Auditor] Profile Photo Upload is a Stub**: Step 4 of the `RegisterForm.jsx` UI includes an `<input type="file">` but only logs the selection to the console (`console.log`). The file is never read, converted, or appended to the form state, meaning users cannot actually register with a profile photo as demanded by the story.

### Edge Case
- **[Edge Case Hunter] Stale Vehicle State on Role Change**: If a user selects `DELIVERY_AGENT` in Step 2, checks some vehicle types, and then changes their role to `FARMER` before clicking next, the selected vehicle types remain in the React state and are sent to the backend.
- **[Edge Case Hunter] Missing String Trimming**: While fields like `name` and `email` are explicitly `.trim()`'ed before being sent to the API, `address`, `city`, `state`, and `pincode` are submitted as-is, potentially passing trailing whitespaces to the backend.