using MainApi.Application;
using MainApi.Infrastructure;
using MainApi.Infrastructure.Data;
using MainApi.Web;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddWebServices();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
    await app.InitialiseDatabaseAsync();
}


app.UseHttpsRedirection();
app.MapStaticAssets(); // app.UseStaticFiles();


// Autenticación/Autorización por cookie
app.UseAuthentication();
app.UseAuthorization();

app.MapFallbackToFile("index.html");
app.UseExceptionHandler(options => { });

app.MapEndpoints();


app.Run();