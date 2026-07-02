namespace web_bek.Dto
{
    public class CreateCourseTestDto
    {
        public string CourseId { get; set; }
        public string Title { get; set; }
        public int RequiredCorrect { get; set; }
        public int DurationMinutes { get; set; }
        public List<TestQuestionDto> Questions { get; set; } = new();
    }
}