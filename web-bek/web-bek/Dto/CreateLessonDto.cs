using Microsoft.AspNetCore.Mvc;

namespace web_bek.Dto
{
    public class CreateLessonDto
    {
        public string CourseId { get; set; }
        public string Name { get; set; }
        public string Text { get; set; } 
    }
}
