using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace web_bek.Models
{
    public class TestSubmission
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string TestId { get; set; }
        public string CourseId { get; set; }
        public string UserId { get; set; }

        public int Score { get; set; }
        public bool Passed { get; set; }

        public bool ReviewedByLecturer { get; set; } = false;

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    }
}