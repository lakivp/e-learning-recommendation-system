namespace web_bek.Models
{
    public class Comment
    {
        public string Id { get; set; }
        public string CourseId { get; set; }
        public string UserId { get; set; }
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
