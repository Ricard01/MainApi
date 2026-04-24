using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Validation;
using MainApi.Domain.Constants;

namespace MainApi.Application.Features.Roles.Queries.GetAllPermisos;

[RequirePermission(Permisos.Roles.Crear)]
public record GetAllPermisosQuery : IRequest<IEnumerable<PermisosDto>>
{
}

public class GetAllPermisosQueryHandler : IRequestHandler<GetAllPermisosQuery, IEnumerable<PermisosDto>>
{
    private readonly IAppDbContext _context;

    public GetAllPermisosQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PermisosDto>> Handle(GetAllPermisosQuery request, CancellationToken cancellationToken)
    {
        return await _context.Permisos
            .AsNoTracking()
            .Select(x => new PermisosDto
            {
                Id = x.Id,
                Nombre = x.Nombre,
                Modulo = x.Modulo,
                Descripcion = x.Descripcion
            }).ToListAsync(cancellationToken);
    }
}