namespace web_bek.Dto
{
    public class MyCourseDto
    {
        public string CourseId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }

        public int CompletedLessons { get; set; }
        public int TotalLessons { get; set; }

        public bool IsCompleted { get; set; }
    }
}