namespace web_bek.Dto
{
    public class UserTestViewDto
    {
        public string TestId { get; set; }
        public string Title { get; set; }
        public int RequiredCorrect { get; set; }
        public int DurationMinutes { get; set; }
        public List<UserQuestionDto> Questions { get; set; } = new();
    }
}
