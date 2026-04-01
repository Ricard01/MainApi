# MainApi

Esta es una solucion que serviria como base para futuros proyectos, Desarrollo con Net Core 9.0 y Angular 20 siguiendo los principios de Clean Architecture.

## Migrations

src> dotnet ef migrations add Initial -p Infrastructure -s Web -o Data/Migrations -c AppDbContext   --verbose
src> dotnet ef migrations remove -p Infrastructure -s Web -c AppDbContext --verbose
src> dotnet ef database update -p Infrastructure -s Web -c AppDbContext --verbose

[//]: # (This is a solution for create a Knowledge Base a Single Page App &#40;SPA&#41; with Angular and ASP.NET Core following the principles of Clean Architecture.)

[//]: # ()
[//]: # (Articles)

[//]: # (![Articles-preview]&#40;https://github.com/Ricard01/img/blob/main/knowledge/Article.png&#41;)

[//]: # ()
[//]: # (Tags)

[//]: # (![Tags-preview]&#40;https://github.com/Ricard01/img/blob/main/knowledge/Tags.png&#41;)


## Technologies

* .NET Core 9.0
* Angular 20
* MediatR
* FluentValidation
* SqlServer

### Database Configuration

The template is configured to use an MySql database by default. Verify that the **MainConnection** connection string within **appsettings.json** points to a valid MySQL Server instance.

When you run the application the database will be automatically created (if necessary) and the latest migrations will be applied.

## Started

* Inside WebUI Folder.
    * `dotnet run`

### Migrations

* Install in the root of the repository (if it is not installed)
    * `dotnet new tool-manifest`
    * `dotnet tool install dotnet-ef`
* `dotnet ef migrations add Initial -p Infrastructure/ -s WebUI/ -o Persistence/Migrations` (for more info add -v)
* `dotnet ef migrations remove -p Infrastructure/ -s WebUI/`

### Notes

* Default UserName: admin Password: Nolose99!.
