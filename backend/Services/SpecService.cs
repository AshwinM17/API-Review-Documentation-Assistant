using ApiDocAssistant.Models;
using Microsoft.OpenApi.Models;
using Microsoft.OpenApi.Readers;
using Microsoft.OpenApi.Writers;

namespace ApiDocAssistant.Services;

public class SpecService(HttpClient httpClient)
{
    /// <summary>Fetches the raw spec text from a URL.</summary>
    public async Task<string> FetchRawAsync(string url)
    {
        var response = await httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }

    /// <summary>Fetches a spec and returns a structured ParsedSpec object.</summary>
    public async Task<ParsedSpec> FetchAndParseAsync(string url)
    {
        var raw = await FetchRawAsync(url);
        return Parse(raw);
    }

    /// <summary>Parses raw OpenAPI JSON or YAML text into a ParsedSpec.</summary>
    public ParsedSpec Parse(string raw)
    {
        var reader = new OpenApiStringReader();
        var doc = reader.Read(raw, out var diagnostic);

        if (doc is null)
            throw new InvalidOperationException(
                $"Could not parse OpenAPI spec: {string.Join("; ", diagnostic.Errors.Select(e => e.Message))}");

        var parsed = new ParsedSpec
        {
            Title       = doc.Info?.Title       ?? "Untitled API",
            Description = doc.Info?.Description ?? string.Empty,
            Version     = doc.Info?.Version     ?? string.Empty,
            BaseUrl     = doc.Servers?.FirstOrDefault()?.Url ?? string.Empty,
        };

        foreach (var (path, pathItem) in doc.Paths)
        {
            foreach (var (opType, operation) in pathItem.Operations)
            {
                var endpoint = new ParsedEndpoint
                {
                    Path        = path,
                    Method      = opType.ToString().ToUpperInvariant(),
                    Summary     = operation.Summary     ?? string.Empty,
                    Description = operation.Description ?? string.Empty,
                    OperationId = operation.OperationId ?? string.Empty,
                    Tags        = operation.Tags?.Select(t => t.Name).ToList() ?? [],

                    Parameters = operation.Parameters?.Select(p => new ParsedParameter
                    {
                        Name        = p.Name,
                        In          = p.In?.ToString() ?? string.Empty,
                        Description = p.Description ?? string.Empty,
                        Required    = p.Required,
                        Type        = p.Schema?.Type ?? string.Empty,
                    }).ToList() ?? [],

                    Responses = operation.Responses?.Select(r => new ParsedResponse
                    {
                        StatusCode  = r.Key,
                        Description = r.Value.Description ?? string.Empty,
                    }).ToList() ?? [],
                };

                // Request body
                if (operation.RequestBody is not null)
                {
                    endpoint.RequestBodyDescription = operation.RequestBody.Description;

                    if (operation.RequestBody.Content.TryGetValue("application/json", out var media)
                        && media.Schema is not null)
                    {
                        endpoint.RequestBodySchema = SerializeSchema(media.Schema);
                    }
                }

                parsed.Endpoints.Add(endpoint);
            }
        }

        return parsed;
    }

    // ── helpers ──────────────────────────────────────────────────────────────────

    private static string SerializeSchema(OpenApiSchema schema)
    {
        using var sw = new StringWriter();
        var writer = new OpenApiJsonWriter(sw);
        schema.SerializeAsV3(writer);
        return sw.ToString();
    }
}
