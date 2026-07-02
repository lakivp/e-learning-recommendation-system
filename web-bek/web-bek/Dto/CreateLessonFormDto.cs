using Microsoft.AspNetCore.Mvc;

namespace web_bek.Controllers
{
    public class CreateLessonFormDto
    {
        [FromForm(Name = "courseId")]
        public string CourseId { get; set; }

        [FromForm(Name = "name")]
        public string Name { get; set; }

        [FromForm(Name = "text")]
        public string Text { get; set; }

        [FromForm(Name = "file")]
        public IFormFile? File { get; set; } // opcionalno

    }
}
