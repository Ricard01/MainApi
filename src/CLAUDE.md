# Backend Guidelines (.NET 10 Clean Architecture)

## Architecture Conventions
- **Endpoints**: Inherit from `EndpointGroupBase` in `src/Web/Endpoints/`. Implement `public override void Map(WebApplication app)`. Do not register endpoints manually in `Program.cs`; they are discovered via reflection.
- **CQRS**:
  - Commands and Queries live in `src/Application/Features/<Feature>/Commands` or `Queries`, and `src/Application/CONTPAQi/<Domain>/`.
  - Always pair Commands with a FluentValidation validator (`AbstractValidator<TCommand>`).
  - Use `Ardalis.GuardClauses` for defensive parameter checks.
- **Entities & Auditing**:
  - Mutable entities inherit from `BaseAuditableEntity` (`src/Domain/Common/BaseAuditableEntity.cs`).
  - Auditing fields (`Created`, `CreatedBy`, `LastModified`, `LastModifiedBy`) are populated automatically by `AuditableEntityInterceptor`.
- **CONTPAQi Integration**:
  - Use `IContpaqiSqlConnection` with Dapper for raw SQL queries against CONTPAQi databases.
  - Connection configurations are stored encrypted using `IEncryptionService`.
- **Authentication**:
  - Endpoints default to requiring authentication via fallback authorization policy. Use `.AllowAnonymous()` explicitly on endpoints intended to be public.
