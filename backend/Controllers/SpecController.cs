using ApiDocAssistant.Models;
using ApiDocAssistant.Services;
using Microsoft.AspNetCore.Mvc;

namespace ApiDocAssistant.Controllers;

[ApiController]
[Route("api/spec")]
public class SpecController(SpecService specService) : ControllerBase
{
    /// <summary>
    /// Fetches/parses an OpenAPI spec.
    /// Accepts either { "url": "https://..." } or { "content": "raw yaml/json text" }.
    /// POST /api/spec/view
    /// </summary>
    [HttpPost("view")]
    public async Task<IActionResult> View([FromBody] SpecRequest request)
    {
        // Validate — exactly one of url or content must be provided
        var hasUrl     = !string.IsNullOrWhiteSpace(request.Url);
        var hasContent = !string.IsNullOrWhiteSpace(request.Content);

        if (!hasUrl && !hasContent)
            return BadRequest(new ErrorResponse { Error = "Provide either a URL or file content." });

        try
        {
            var parsed = hasContent
                ? specService.Parse(request.Content!)
                : await specService.FetchAndParseAsync(request.Url!);

            return Ok(parsed);
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