namespace web_bek.Dto
{
    public class LessonViewDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Text { get; set; }
        public string FilePath { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsLocked { get; set; }
    }
}
