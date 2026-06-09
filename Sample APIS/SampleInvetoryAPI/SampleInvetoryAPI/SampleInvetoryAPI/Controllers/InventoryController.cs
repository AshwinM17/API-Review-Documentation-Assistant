using Microsoft.AspNetCore.Mvc;
using SampleInvetoryAPI.Models;

namespace SampleInvetoryAPI.Controllers
{
    [ApiController]
    [Route("api/inventory")]
    public class InventoryController : Controller
    {
        private static List<InventoryItem> inventory = new List<InventoryItem>
        {
            new InventoryItem
            {
                Id = 1,
                ProductName = "Laptop",
                SKU = "LAP-1001",
                StockQuantity = 25,
                WarehouseLocation = "Warehouse-A",
                LastUpdated = DateTime.UtcNow
            },
            new InventoryItem
            {
                Id=2,
                ProductName="Iphone",
                SKU="ABL-101",
                StockQuantity=17,
                WarehouseLocation="Warehouse-D",
                LastUpdated= DateTime.UtcNow
            }
            
        };
        [HttpGet]
        public ActionResult Inventory()
        {
            return Ok(inventory);
        }
        [HttpGet("{id}")]
        public IActionResult GetItem(int id)
        {
            var item = inventory.FirstOrDefault(i => i.Id == id);

            if (item == null)
                return NotFound(id);

            return Ok(item);
        }

        [HttpPost]
        public IActionResult CreateItem(InventoryItem item)
        {
            item.Id = inventory.Count + 1;
            item.LastUpdated = DateTime.UtcNow;

            inventory.Add(item);

            return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateItem(int id, InventoryItem updatedItem)
        {
            var item = inventory.FirstOrDefault(i => i.Id == id);

            if (item == null)
                return NotFound(id);

            item.ProductName = updatedItem.ProductName;
            item.SKU = updatedItem.SKU;
            item.StockQuantity = updatedItem.StockQuantity;
            item.WarehouseLocation = updatedItem.WarehouseLocation;
            item.LastUpdated = DateTime.UtcNow;

            return NoContent();
        }
        [HttpDelete("{id}")]
        public IActionResult DeleteItem(int id)
        {
            var item = inventory.FirstOrDefault(i => i.Id == id);

            if (item == null)
                return NotFound();

            inventory.Remove(item);

            return NoContent();
        }

    }
}
