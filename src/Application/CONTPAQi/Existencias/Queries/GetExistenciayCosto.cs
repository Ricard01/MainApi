using MainApi.Application.Common.Interfaces;

namespace MainApi.Application.CONTPAQi.Existencias.Queries;

public class GetExistenciayCostoQuery : IRequest<ExistenciaCostoDto>;

public class GetExistenciayCostoQueryHandler : IRequestHandler<GetExistenciayCostoQuery, ExistenciaCostoDto>
{
    private readonly IAppDbContext _context;

    public GetExistenciayCostoQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public Task<ExistenciaCostoDto> Handle(GetExistenciayCostoQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}