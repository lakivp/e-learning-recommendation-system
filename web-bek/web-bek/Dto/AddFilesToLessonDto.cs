using Microsoft.AspNetCore.Mvc;

namespace web_bek.Dto
{
    public class AddFilesToLessonDto
    {
        [FromForm(Name = "courseId")]
        public string CourseId { get; set; }

        [FromForm(Name = "lessonId")]
        public string LessonId { get; set; }

        [FromForm(Name = "files")]
        public IFormFileCollection? Files { get; set; }
    }
}
