using ApiDocAssistant.Models;
using ApiDocAssistant.Services;
using Microsoft.AspNetCore.Mvc;

namespace ApiDocAssistant.Controllers;

[ApiController]
[Route("api/spec")]
public class SpecController(SpecService specService) : ControllerBase
{
    /// <summary>
    /// Fetches and parses an OpenAPI/Swagger spec from a URL.
    /// POST /api/spec/view  { "url": "https://..." }
    /// </summary>
    [HttpPost("view")]
    public async Task<IActionResult> View([FromBody] SpecRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Url))
            return BadRequest(new ErrorResponse { Error = "URL is required." });

        try
        {
            var parsed = await specService.FetchAndParseAsync(request.Url);
            return Ok(parsed);
        }
        catch (HttpRequestException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Error = $"Failed to fetch spec from URL: {ex.Message}"
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Error = $"Failed to parse OpenAPI spec: {ex.Message}"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ErrorResponse { Error = ex.Message });
        }
    }
}
