using System.Text.Json;
using ApiDocAssistant.Models;
using ApiDocAssistant.Services;
using Microsoft.AspNetCore.Mvc;

namespace ApiDocAssistant.Controllers;

[ApiController]
[Route("api/chat")]
public class ChatController(SpecService specService, OpenAIService openAIService) : ControllerBase
{
    /// <summary>
    /// Chat with AI about an API spec.
    /// Accepts specUrl (fetch from URL) or specContent (uploaded file text).
    /// POST /api/chat
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        var hasUrl     = !string.IsNullOrWhiteSpace(request.SpecUrl);
        var hasContent = !string.IsNullOrWhiteSpace(request.SpecContent);

        if (!hasUrl && !hasContent)
            return BadRequest(new ErrorResponse { Error = "Provide either specUrl or specContent." });

        if (request.Messages is null || request.Messages.Count == 0)
            return BadRequest(new ErrorResponse { Error = "At least one message is required." });

        // ── Step 1: Obtain the parsed spec ────────────────────────────────────
        ParsedSpec parsed;
        try
        {
            parsed = hasContent
                ? specService.Parse(request.SpecContent!)
                : await specService.FetchAndParseAsync(request.SpecUrl!);
        }
        catch (Exception ex)
        {
            return BadRequest(new ErrorResponse
            {
                Error = $"Failed to fetch/parse spec: {ex.Message}"
            });
        }

        // ── Step 2: Call Azure AI ─────────────────────────────────────────────
        try
        {
            var specJson = JsonSerializer.Serialize(parsed);

            var systemPrompt = $"""
                You are an expert API documentation assistant. You have been given the following OpenAPI/Swagger specification in JSON format.

                API SPECIFICATION:
                {specJson}

                Your responsibilities:
                - Answer questions about this API clearly, accurately, and concisely
                - Explain endpoint purposes, parameters, and expected responses
                - Provide code examples (curl, JavaScript fetch, Python requests, etc.) when helpful
                - Explain authentication requirements if present
                - Help debug integration issues
                - If a question is unrelated to this API, politely redirect to API-related topics

                Always format code in proper markdown code blocks with the correct language tag.
                Be developer-friendly, practical, and to the point.

                Do not answer any questions wwhich do not relate to the API differences. If asked irrelevant questions, politely decline and steer the conversation back to the API
                """;

            var reply = await openAIService.CompleteAsync(systemPrompt, request.Messages);
            return Ok(new AiResponse { Message = reply });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ErrorResponse { Error = $"Azure OpenAI error: {ex.Message}" });
        }
    }
}