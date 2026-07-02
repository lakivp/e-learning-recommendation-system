using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace web_bek.Models
{
    public class CourseTest
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string CourseId { get; set; }
        public string LecturerId { get; set; }

        public string Title { get; set; }
        public int RequiredCorrect { get; set; }

        public int DurationMinutes { get; set; }
        public List<TestQuestion> Questions { get; set; } = new();
    }
}