using Microsoft.AspNetCore.Mvc;
using SampleProductsAPI.Models;

namespace SampleProductsAPI.Controllers.V1
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v1/products")]
    public class ProductsController : ControllerBase
    {
        private static List<ProductV1> products = new()
        {
            new ProductV1 { Id = 1, Name = "Laptop", Price = 70000 },
            new ProductV1 { Id = 2, Name = "Phone", Price = 30000 }
        };

        [HttpGet]
        public IActionResult GetProducts()
        {
            return Ok(products);
        }

        [HttpGet("{id}")]
        public IActionResult GetProduct(int id)
        {
            var product = products.FirstOrDefault(p => p.Id == id);

            if (product == null)
                return NotFound();

            return Ok(product);
        }
    }
}