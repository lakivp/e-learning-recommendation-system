namespace web_bek.Models
{
    public class Course
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string LecturerId { get; set; }
        public List<Lesson> Lessons { get; set; } = new List<Lesson>();
    }
}
