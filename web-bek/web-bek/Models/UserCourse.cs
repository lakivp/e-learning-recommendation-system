using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace web_bek.Models
{
    public class UserCourse
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string UserId { get; set; }
        public string CourseId { get; set; }
        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        public List<CompletedLessonInfo> CompletedLessons { get; set; } = new();
    }
}
