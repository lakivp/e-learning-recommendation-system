namespace web_bek.Dto
{
    public class DayActivityDto
    {
        public string Type { get; set; }// CourseEnrolled | LessonCompleted | Comment
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
