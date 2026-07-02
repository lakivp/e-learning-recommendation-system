namespace web_bek.Dto
{
    public class UserQuestionDto
    {
        public string Id { get; set; }
        public string Text { get; set; }
        public List<UserAnswerDto> Answers { get; set; } = new();
    }
}
