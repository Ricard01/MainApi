namespace MainApi.Application.Common.Validation;

/// <summary>
/// Para marcar un Command o Query que requiera permiso(s)
/// </summary>
[AttributeUsage(AttributeTargets.Class, AllowMultiple = true, Inherited = true)]
public class RequirePermissionAttribute  : Attribute
{
    public string PermissionName  { get; }

    public RequirePermissionAttribute(string permissionName)
    {
        PermissionName = permissionName;
    }
   
    
  
}
