namespace SampleInvetoryAPI.Models
{
    public class InventoryItem
    {
        public int Id { get; set; }

        public required string ProductName { get; set; }

        public required string SKU { get; set; }

        public int StockQuantity { get; set; }

        public string WarehouseLocation { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}