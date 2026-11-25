# Frontend Guidelines (Angular 20 Standalone)

## Component & Architecture Standards
- **Standalone**: All components are standalone (`standalone: true`).
- **Change Detection**: Strict `changeDetection: ChangeDetectionStrategy.OnPush` across all components.
- **State Management**:
  - Global authentication and session state uses NgRx (`provideAuthFeature`).
  - Components interact with state through Facades (e.g., `AuthFacade`), not by injecting `Store` directly.
- **Styling**:
  - Tailwind CSS v4 (`@tailwindcss/postcss`). Prefer utility classes over custom CSS files.
  - Angular Material 20 (`@angular/material`) for form fields, tables, dialogs and paginators.
  - Watch bundle sizes: Component CSS must stay within the 8kB budget configured in `angular.json`.
- **HTTP & API**:
  - Backend API base URL is provided by the `API_BASE_URL` token (`/api`).
  - Authentication is cookie-based with automatic 401/403 interceptor handling in `errorInterceptor`.
- **Localization**:
  - Configured for `es-MX`. Material paginator uses custom translation `translatePaginator`.
