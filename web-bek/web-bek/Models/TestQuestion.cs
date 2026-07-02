using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace web_bek.Models
{
    public class TestQuestion
    {
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
        public string Text { get; set; }
        public List<string> Options { get; set; } = new();
        public int CorrectIndex { get; set; }
    }
}