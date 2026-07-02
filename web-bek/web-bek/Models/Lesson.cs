namespace web_bek.Models
{
    public class Lesson
    {
        public string Id { get; set; }
        public string CourseId { get; set; }
        public string Name { get; set; }
        public string? Text { get; set; }
        public string? FilePath { get; set; }
    }
}
