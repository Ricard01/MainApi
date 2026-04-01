// using IMSS.Application.Common.Interfaces;
//
// namespace IMSS.Application.Core.Auth.Queries.GetCurrentUserProfile;
//
//
// public record GetCurrentUserProfileQuery(string UserId) : IRequest<CurrentUserProfileVm>;
//
// public record CurrentUserProfileVm(string Id, string? UserName, string? Email, IEnumerable<string> Roles);
//
// public class GetCurrentUserProfileQueryHandler 
//     : IRequestHandler<GetCurrentUserProfileQuery, CurrentUserProfileVm>
// {
//     private readonly IIdentityService _identity;
//     public GetCurrentUserProfileQueryHandler(IIdentityService identity) => _identity = identity;
//
//     public async Task<CurrentUserProfileVm> Handle(GetCurrentUserProfileQuery request, CancellationToken ct)
//     {
//         var user = await _identity.FindByIdAsync(request.UserId, ct);
//         if (user is null) throw new UnauthorizedAccessException();
//
//         var roles = await _identity.GetRolesAsync(user, ct);
//         return new CurrentUserProfileVm(user.Id, user.UserName, user.Email, roles);
//     }
// }
