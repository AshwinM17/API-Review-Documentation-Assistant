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
    /// Compare two API specs with AI.
    /// Each spec can be provided as a URL or as raw uploaded file content.
    /// All four combinations work: url+url, file+file, url+file, file+url.
    /// POST /api/compare
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Compare([FromBody] CompareRequest request)
    {
        var hasUrl1     = !string.IsNullOrWhiteSpace(request.SpecUrl1);
        var hasContent1 = !string.IsNullOrWhiteSpace(request.SpecContent1);
        var hasUrl2     = !string.IsNullOrWhiteSpace(request.SpecUrl2);
        var hasContent2 = !string.IsNullOrWhiteSpace(request.SpecContent2);

        if (!hasUrl1 && !hasContent1)
            return BadRequest(new ErrorResponse { Error = "Provide either specUrl1 or specContent1." });

        if (!hasUrl2 && !hasContent2)
            return BadRequest(new ErrorResponse { Error = "Provide either specUrl2 or specContent2." });

        if (request.Messages is null || request.Messages.Count == 0)
            return BadRequest(new ErrorResponse { Error = "At least one message is required." });

        // ── Step 1: Obtain both parsed specs ──────────────────────────────────
        // Task.FromResult handles the synchronous parse case so WhenAll still
        // runs both in parallel when both are URLs.
        ParsedSpec spec1, spec2;
        try
        {
            var task1 = hasContent1
                ? Task.FromResult(specService.Parse(request.SpecContent1!))
                : specService.FetchAndParseAsync(request.SpecUrl1!);

            var task2 = hasContent2
                ? Task.FromResult(specService.Parse(request.SpecContent2!))
                : specService.FetchAndParseAsync(request.SpecUrl2!);

            await Task.WhenAll(task1, task2);
            spec1 = task1.Result;
            spec2 = task2.Result;
        }
        catch (Exception ex)
        {
            return BadRequest(new ErrorResponse
            {
                Error = $"Failed to fetch/parse one or both specs: {ex.Message}"
            });
        }

        // ── Step 2: Call Azure AI ─────────────────────────────────────────────
        try
        {
            var spec1Json = JsonSerializer.Serialize(spec1);
            var spec2Json = JsonSerializer.Serialize(spec2);

            var systemPrompt = $"""
                You are an expert API versioning and migration analyst. You have been given two OpenAPI/Swagger specifications to compare.

                ── SPECIFICATION 1 (Baseline) ───────────────────────────────────────
                {spec1Json}

                ── SPECIFICATION 2 (Comparison) ─────────────────────────────────────
                {spec2Json}

                Your responsibilities:
                - Provide a clear, structured comparison between the two APIs
                - Identify added endpoints (in Spec 2 but not Spec 1)
                - Identify removed endpoints (in Spec 1 but not Spec 2)
                - Identify changed endpoints (same path/method, different params or responses)
                - Flag BREAKING CHANGES with ⚠️ (removed endpoints, removed required fields, changed response shape)
                - Flag NON-BREAKING additions with ✅ (new optional fields, new endpoints)
                - Compare version differences
                - Provide migration guidance when relevant
                - Answer follow-up questions about specific differences

                Format your response with clear markdown sections.
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