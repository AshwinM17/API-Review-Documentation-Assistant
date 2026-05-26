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
    /// Sends a chat message about a given OpenAPI spec to Azure OpenAI.
    /// POST /api/chat  { "specUrl": "...", "messages": [...] }
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.SpecUrl))
            return BadRequest(new ErrorResponse { Error = "specUrl is required." });

        if (request.Messages is null || request.Messages.Count == 0)
            return BadRequest(new ErrorResponse { Error = "At least one message is required." });

        try
        {
            // Fetch and parse the spec to use as AI context
            var parsed = await specService.FetchAndParseAsync(request.SpecUrl);
            var specJson = JsonSerializer.Serialize(parsed, new JsonSerializerOptions
            {
                WriteIndented = false
            });

            var systemPrompt = $"""
                You are an expert API documentation assistant. You have been given the following OpenAPI/Swagger specification in JSON format.

                API SPECIFICATION:
                {specJson}

                Your responsibilities:
                - Answer questions about this API clearly, accurately, and concisely
                - Explain endpoint purposes, parameters, and expected responses
                - Provide code examples (curl, JavaScript fetch, Python requests, etc.) when they would be helpful
                - Explain authentication requirements if present
                - Help debug integration issues
                - If a question is unrelated to this API, politely redirect to API-related topics

                Always format code in proper markdown code blocks with the correct language tag.
                Be developer-friendly, practical, and to the point.
                """;

            var reply = await openAIService.CompleteAsync(systemPrompt, request.Messages);
            return Ok(new AiResponse { Message = reply });
        }
        catch (HttpRequestException ex)
        {
            return BadRequest(new ErrorResponse { Error = $"Failed to fetch spec: {ex.Message}" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ErrorResponse { Error = $"Failed to parse spec: {ex.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ErrorResponse { Error = ex.Message });
        }
    }
}
