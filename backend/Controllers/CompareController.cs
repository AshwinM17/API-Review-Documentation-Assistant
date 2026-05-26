using System.Text.Json;
using ApiDocAssistant.Models;
using ApiDocAssistant.Services;
using Microsoft.AspNetCore.Mvc;

namespace ApiDocAssistant.Controllers;

[ApiController]
[Route("api/compare")]
public class CompareController(SpecService specService, OpenAIService openAIService) : ControllerBase
{
    /// <summary>
    /// Fetches two API specs and uses Azure OpenAI to compare them.
    /// POST /api/compare  { "specUrl1": "...", "specUrl2": "...", "messages": [...] }
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Compare([FromBody] CompareRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.SpecUrl1) || string.IsNullOrWhiteSpace(request.SpecUrl2))
            return BadRequest(new ErrorResponse { Error = "Both specUrl1 and specUrl2 are required." });

        if (request.Messages is null || request.Messages.Count == 0)
            return BadRequest(new ErrorResponse { Error = "At least one message is required." });

        try
        {
            // Fetch both specs concurrently
            var (spec1Task, spec2Task) = (
                specService.FetchAndParseAsync(request.SpecUrl1),
                specService.FetchAndParseAsync(request.SpecUrl2)
            );

            await Task.WhenAll(spec1Task, spec2Task);

            var spec1Json = JsonSerializer.Serialize(spec1Task.Result);
            var spec2Json = JsonSerializer.Serialize(spec2Task.Result);

            var systemPrompt = $"""
                You are an expert API versioning and migration analyst. You have been given two OpenAPI/Swagger specifications to compare.

                ── SPECIFICATION 1 (First / Baseline) ──────────────────────────────
                {spec1Json}

                ── SPECIFICATION 2 (Second / Comparison) ───────────────────────────
                {spec2Json}

                Your responsibilities:
                - Provide a clear, structured comparison between the two APIs
                - Identify added endpoints (exist in Spec 2 but not Spec 1)
                - Identify removed endpoints (exist in Spec 1 but not Spec 2)
                - Identify changed endpoints (same path/method but different parameters, request body, or responses)
                - Clearly flag BREAKING CHANGES (e.g. removed endpoints, removed required fields, changed response shape)
                - Note NON-BREAKING changes (e.g. added optional fields, new endpoints)
                - Compare version differences
                - Provide migration guidance when relevant
                - Answer follow-up questions about specific differences

                Format your response with clear markdown sections. Use ⚠️ for breaking changes and ✅ for non-breaking additions.
                """;

            var reply = await openAIService.CompleteAsync(systemPrompt, request.Messages);
            return Ok(new AiResponse { Message = reply });
        }
        catch (HttpRequestException ex)
        {
            return BadRequest(new ErrorResponse { Error = $"Failed to fetch one or both specs: {ex.Message}" });
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
