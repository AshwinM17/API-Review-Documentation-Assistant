namespace ApiDocAssistant.Models;

// ─── Request models ────────────────────────────────────────────────────────────

public class SpecRequest
{
    public string Url { get; set; } = string.Empty;
}

public class ChatRequest
{
    public string SpecUrl { get; set; } = string.Empty;
    public List<ChatMessage> Messages { get; set; } = new();
}

public class CompareRequest
{
    public string SpecUrl1 { get; set; } = string.Empty;
    public string SpecUrl2 { get; set; } = string.Empty;
    public List<ChatMessage> Messages { get; set; } = new();
}

public class ChatMessage
{
    public string Role { get; set; } = string.Empty;   // "user" | "assistant"
    public string Content { get; set; } = string.Empty;
}

// ─── Parsed spec models ────────────────────────────────────────────────────────

public class ParsedSpec
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public List<ParsedEndpoint> Endpoints { get; set; } = new();
}

public class ParsedEndpoint
{
    public string Path { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string OperationId { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public List<ParsedParameter> Parameters { get; set; } = new();
    public List<ParsedResponse> Responses { get; set; } = new();
    public string? RequestBodyDescription { get; set; }
    public string? RequestBodySchema { get; set; }
}

public class ParsedParameter
{
    public string Name { get; set; } = string.Empty;
    public string In { get; set; } = string.Empty;        // path | query | header | cookie
    public string Description { get; set; } = string.Empty;
    public bool Required { get; set; }
    public string Type { get; set; } = string.Empty;
}

public class ParsedResponse
{
    public string StatusCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

// ─── Response models ───────────────────────────────────────────────────────────

public class AiResponse
{
    public string Message { get; set; } = string.Empty;
}

public class ErrorResponse
{
    public string Error { get; set; } = string.Empty;
}
