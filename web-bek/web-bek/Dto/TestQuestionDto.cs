namespace web_bek.Dto
{
    public class TestQuestionDto
    {
        public string Text { get; set; }
        public List<string> Options { get; set; } = new();
        public int CorrectIndex { get; set; }
    }
}