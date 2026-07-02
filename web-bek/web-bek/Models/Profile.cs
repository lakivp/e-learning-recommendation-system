using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace web_bek.Models
{
    public class Profile
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string UserId { get; set; }

        public string Bio { get; set; }

        public string Phone { get; set; }

        public string Interests { get; set; }
    }
}