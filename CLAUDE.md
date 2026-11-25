# MainApi Assistant Guidelines

Full-stack solution: .NET 10 (Clean Architecture + CQRS + Minimal APIs) and Angular 20 Standalone (Material + Tailwind v4 + NgRx).

## Build & Run Commands
- **Build Backend**: `dotnet build MainApi.slnx`
- **Run Backend**: `dotnet run --project src/Web/Web.csproj`
- **Build Frontend (Dev)**: `cd src/Web/ClientApp && npm run watch`
- **Run Frontend**: `cd src/Web/ClientApp && npm start`
- **Run Frontend Tests**: `cd src/Web/ClientApp && npm test`
- **Note on Production Build**: `npm run build` currently triggers budget errors in `factura-preview.css` and `cotizacion-preview.css` (>8kB). Use `--configuration development` for dev builds or adjust budgets in `angular.json`.

## EF Core Migrations (Run from repository root)
- **Add Migration**: `dotnet ef migrations add <Name> -p src/Infrastructure -s src/Web -o Data/Migrations -c AppDbContext`
- **Update Database**: `dotnet ef database update -p src/Infrastructure -s src/Web -c AppDbContext`
- **Remove Migration**: `dotnet ef migrations remove -p src/Infrastructure -s src/Web -c AppDbContext`

## Solution Structure & Architecture
- `src/Domain`: Enterprise entities, enums, value objects. Zero external dependencies.
- `src/Application`: CQRS with MediatR & FluentValidation. Commands/Queries in `Features/` or `CONTPAQi/`.
- `src/Infrastructure`: EF Core `AppDbContext`, SQL Server connection, Dapper for CONTPAQi direct queries.
- `src/Web`: Minimal APIs extending `EndpointGroupBase`. Auto-registered via reflection. Cookie Auth.
- `src/Web/ClientApp`: Angular 20 SPA with NgRx, Tailwind v4 and Angular Material.

## Coding Standards & Critical Rules
- **Compiler Warnings**: `TreatWarningsAsErrors` is `true`. Code will NOT compile with warnings.
- **Nullability**: C# Nullable reference types enabled (`<Nullable>enable</Nullable>`).
- **Dependencies**: Central Package Management (`Directory.Packages.props`). Never put `<PackageReference Version="..." />` inside `.csproj` files.
- **Frontend Changes**: Follow Angular 20 Standalone patterns with `changeDetection: ChangeDetectionStrategy.OnPush`.
- **Database Context**: Keep EF Core for application identity and auditing; use Dapper/SqlClient for CONTPAQi read/write procedures.
