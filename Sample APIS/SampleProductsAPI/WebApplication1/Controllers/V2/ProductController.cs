using Microsoft.AspNetCore.Mvc;
using SampleProductsAPI.Models;

namespace SampleProductsAPI.Controllers.V2
{
    [ApiController]
    [ApiVersion("2.0")]
    [Route("api/v2/products")]
    public class ProductsController : ControllerBase
    {
        private static List<ProductV2> products = new()
        {
            new ProductV2 { Id = 1, Name = "Laptop", Price = 70000, Category = "Electronics", Stock = 10 }
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

        [HttpPost]
        public IActionResult CreateProduct(ProductV2 product)
        {
            product.Id = products.Count + 1;
            products.Add(product);

            return Created("", product);
        }
    }
}