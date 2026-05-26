using System.Text;
using System.Text.Json;
using ApiDocAssistant.Models;

namespace ApiDocAssistant.Services;

public class OpenAIService(HttpClient httpClient, IConfiguration config)
{
    private readonly string _endpoint       = config["AzureOpenAI:Endpoint"]       ?? throw new InvalidOperationException("AzureOpenAI:Endpoint is not configured.");
    private readonly string _apiKey         = config["AzureOpenAI:ApiKey"]         ?? throw new InvalidOperationException("AzureOpenAI:ApiKey is not configured.");
    private readonly string _deploymentName = config["AzureOpenAI:DeploymentName"] ?? throw new InvalidOperationException("AzureOpenAI:DeploymentName is not configured.");
    private readonly string _apiVersion     = config["AzureOpenAI:ApiVersion"]     ?? "2024-02-15-preview";

    // Detects whether this is an Azure AI Foundry endpoint (services.ai.azure.com)
    // or a standard Azure OpenAI endpoint (openai.azure.com).
    private bool IsFoundryEndpoint =>
        _endpoint.Contains("services.ai.azure.com", StringComparison.OrdinalIgnoreCase);

    public async Task<string> CompleteAsync(string systemPrompt, List<ChatMessage> messages)
    {
        var url     = BuildUrl();
        var body    = BuildBody(systemPrompt, messages);
        var request = BuildRequest(url, body);

        var response = await httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException(
                $"Azure OpenAI returned {(int)response.StatusCode}: {errorBody}");
        }

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);

        return doc.RootElement
                  .GetProperty("choices")[0]
                  .GetProperty("message")
                  .GetProperty("content")
                  .GetString()
               ?? string.Empty;
    }

    // ── URL ───────────────────────────────────────────────────────────────────
    // Azure AI Foundry  → {endpoint}/chat/completions          (model goes in body)
    // Standard Azure OAI → {endpoint}/openai/deployments/{name}/chat/completions?api-version=...
    private string BuildUrl()
    {
        var base_ = _endpoint.TrimEnd('/');

        if (IsFoundryEndpoint)
            return $"{base_}/chat/completions";

        return $"{base_}/openai/deployments/{_deploymentName}/chat/completions?api-version={_apiVersion}";
    }

    // ── Request body ──────────────────────────────────────────────────────────
    // Foundry requires "model" field in the body; standard Azure OAI ignores it.
    private object BuildBody(string systemPrompt, List<ChatMessage> messages)
    {
        var allMessages = new List<object>
        {
            new { role = "system", content = systemPrompt }
        };
        allMessages.AddRange(messages.Select(m => new { role = m.Role, content = m.Content }));

        if (IsFoundryEndpoint)
        {
            return new
            {
                model       = _deploymentName,
                messages    = allMessages,
                max_tokens  = 2500,
                temperature = 0.4
            };
        }

        return new
        {
            messages    = allMessages,
            max_tokens  = 2500,
            temperature = 0.4
        };
    }

    // ── Auth header ───────────────────────────────────────────────────────────
    // Foundry uses:        Authorization: Bearer {key}
    // Standard Azure OAI: api-key: {key}
    private HttpRequestMessage BuildRequest(string url, object body)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Content = new StringContent(
            JsonSerializer.Serialize(body),
            Encoding.UTF8,
            "application/json");

        if (IsFoundryEndpoint)
            request.Headers.Add("Authorization", $"Bearer {_apiKey}");
        else
            request.Headers.Add("api-key", _apiKey);

        return request;
    }
}
