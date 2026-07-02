namespace web_bek.Dto
{
    public class CommentViewDto
    {
        public string Id { get; set; }
        public string CourseId { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; } 
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsMine {  get; set; }
    }
}