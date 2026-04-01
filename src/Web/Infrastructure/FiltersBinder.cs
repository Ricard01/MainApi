// public sealed class FiltersBinder : Dictionary<string, string>
// {
//     // Comentario: Nombre del prefijo que esperamos en querystring: Filters[clave]=valor
//     private const string Prefix = "Filters[";
//
//     // Comentario: Método estándar para Minimal APIs; decide cómo bindear este tipo desde el request.
//     public static ValueTask<FiltersBinder?> BindAsync(HttpContext ctx)
//     {
//         var result = new FiltersBinder();
//
//         foreach (var (key, value) in ctx.Request.Query)
//         {
//             // Solo nos interesan entradas tipo Filters[algo]
//             if (key.StartsWith(Prefix, StringComparison.Ordinal) && key.EndsWith("]", StringComparison.Ordinal))
//             {
//                 // Tomamos el nombre interno de la clave entre corchetes
//                 var innerKey = key.Substring(Prefix.Length, key.Length - Prefix.Length - 1);
//                 if (!string.IsNullOrWhiteSpace(innerKey))
//                 {
//                     // Importante: ToString() para tomar el primer valor; si necesitas múltiples, ajusta aquí
//                     result[innerKey] = value.ToString();
//                 }
//             }
//         }
//
//         return ValueTask.FromResult<FiltersBinder?>(result);
//     }
// }
