namespace web_bek.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using MongoDB.Bson;
    using MongoDB.Driver;
    using web_bek.Dto;
    using web_bek.Models;
    using web_bek.Services;

    [ApiController]
    [Route("api/admin/courses")]
    [Authorize]
    public class AdminCoursesController : ControllerBase
    {
        private readonly MongoDbService _mongo;
        private readonly IWebHostEnvironment _env;

        public AdminCoursesController(MongoDbService mongo, IWebHostEnvironment env)
        {
            _mongo = mongo;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetCourses()
        {
            var courses = await _mongo.Courses.Find(_ => true).ToListAsync();
            return Ok(courses);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCourse(CreateCourseDto dto)
        {
            var userId = User.FindFirst("id")?.Value;
            var course = new Course 
            { 
                Id = ObjectId.GenerateNewId().ToString(), 
                Title = dto.Title, 
                Description = dto.Description,
                LecturerId = userId
            };
            await _mongo.Courses.InsertOneAsync(course);
            return Ok(course);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateCourse(UpdateCourseDto dto)
        {
            var update = Builders<Course>.Update
                .Set(x => x.Title, dto.Title)
                .Set(x => x.Description, dto.Description);

            await _mongo.Courses.UpdateOneAsync(x => x.Id == dto.Id, update);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(string id)
        {
            // brisem kurs
            var result = await _mongo.Courses.DeleteOneAsync(x => x.Id == id);

            if (result.DeletedCount == 0)
                return NotFound(new { message = "Course not found" });

            // brisem sve komentare za taj kurs
            await _mongo.Comments.DeleteManyAsync(c => c.CourseId == id);

            // brisem sve upise korisnika na taj kurs
            await _mongo.UserCourses.DeleteManyAsync(uc => uc.CourseId == id);

            return Ok();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCourse(string id)
        {
            var course = await _mongo.Courses.Find(x => x.Id == id).FirstOrDefaultAsync();
            if (course == null) return NotFound();
            return Ok(course);
        }

        [HttpGet("{courseId}/comments")]
        public async Task<IActionResult> GetCourseComments(string courseId)
        {
            var comments = await _mongo.Comments
                .Find(c => c.CourseId == courseId)
                .SortByDescending(c => c.CreatedAt)
                .ToListAsync();

            var userIds = comments.Select(c => c.UserId).Distinct().ToList();
            var users = await _mongo.Users
                .Find(u => userIds.Contains(u.Id))
                .ToListAsync();

            var result = comments.Select(c => new CommentViewDto
            {
                Id = c.Id,
                CourseId = c.CourseId,
                UserId = c.UserId,
                UserName = users.FirstOrDefault(u => u.Id == c.UserId)?.Username ?? "Unknown",
                Text = c.Text,
                CreatedAt = c.CreatedAt
            }).ToList();

            return Ok(result);
        }

        [HttpDelete("comments/{id}")]
        public async Task<IActionResult> DeleteComment(string id)
        {
            await _mongo.Comments.DeleteOneAsync(c => c.Id == id);
            return Ok();
        }

        [HttpPost("lesson")]
        public async Task<IActionResult> AddLesson([FromForm] CreateLessonFormDto dto)
        {
            var lesson = new Lesson
            {
                Id = Guid.NewGuid().ToString(),
                CourseId = dto.CourseId,
                Name = dto.Name,
                Text = dto.Text
            };

            if (dto.File != null && dto.File.Length > 0)
            {
                string uploads = Path.Combine(_env.ContentRootPath, "Uploads");
                if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);

                string originalFileName = Path.GetFileNameWithoutExtension(dto.File.FileName);
                string extension = Path.GetExtension(dto.File.FileName);
                string uniqueFileName = $"{originalFileName}_{DateTime.Now.Ticks}{extension}";
                string filePath = Path.Combine(uploads, uniqueFileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await dto.File.CopyToAsync(stream);

                lesson.FilePath = "/uploads/" + uniqueFileName;
            }

            var update = Builders<Course>.Update.Push(x => x.Lessons, lesson);
            await _mongo.Courses.UpdateOneAsync(x => x.Id == dto.CourseId, update);

            return Ok(lesson);
        }

        [HttpPut("lesson")]
        public async Task<IActionResult> UpdateLesson(UpdateLessonDto dto)
        {
            var course = await _mongo.Courses.Find(x => x.Id == dto.CourseId).FirstOrDefaultAsync();
            var lesson = course.Lessons.FirstOrDefault(l => l.Id == dto.LessonId);
            if (lesson == null) return NotFound();

            lesson.Name = dto.Name;
            lesson.Text = dto.Text;
            var update = Builders<Course>.Update.Set(x => x.Lessons, course.Lessons);
            await _mongo.Courses.UpdateOneAsync(x => x.Id == dto.CourseId, update);

            return Ok();
        }

        [HttpPost("lesson/upload")]
        public async Task<IActionResult> UploadLessonFile([FromForm] IFormFile file, [FromForm] string courseId, [FromForm] string lessonId)
        {
            if (file == null || file.Length == 0) return BadRequest();

            string uploads = Path.Combine(_env.ContentRootPath, "Uploads");
            if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);

            string originalFileName = Path.GetFileNameWithoutExtension(file.FileName);
            string extension = Path.GetExtension(file.FileName);

            string uniqueFileName = $"{originalFileName}_{DateTime.Now.Ticks}{extension}";
            string filePath = Path.Combine(uploads, uniqueFileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            var course = await _mongo.Courses.Find(x => x.Id == courseId).FirstOrDefaultAsync();
            var lesson = course.Lessons.FirstOrDefault(l => l.Id == lessonId);
            if (lesson != null) lesson.FilePath = "/uploads/" + uniqueFileName;

            var update = Builders<Course>.Update.Set(x => x.Lessons, course.Lessons);
            await _mongo.Courses.UpdateOneAsync(x => x.Id == courseId, update);

            return Ok();
        }

        [HttpDelete("lesson")]
        public async Task<IActionResult> DeleteLesson(
            [FromQuery] string courseId,
            [FromQuery] string lessonId)
        {
            var course = await _mongo.Courses
                .Find(x => x.Id == courseId)
                .FirstOrDefaultAsync();

            if (course == null) return NotFound();

            course.Lessons = course.Lessons
                .Where(l => l.Id != lessonId)
                .ToList();

            var update = Builders<Course>.Update
                .Set(x => x.Lessons, course.Lessons);

            await _mongo.Courses.UpdateOneAsync(x => x.Id == courseId, update);

            return Ok();
        }

        [HttpGet("lesson/download")]
        public IActionResult DownloadLessonFile([FromQuery] string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return BadRequest();

            var uploadsPath = Path.Combine(_env.ContentRootPath, "Uploads");
            var fullPath = Path.Combine(uploadsPath, fileName);

            if (!System.IO.File.Exists(fullPath))
                return NotFound();

            var bytes = System.IO.File.ReadAllBytes(fullPath);

            return File(
                bytes,
                "application/octet-stream",
                fileName
            );
        }

        [HttpDelete("lesson/file")]
        public async Task<IActionResult> DeleteLessonFile([FromQuery] string courseId, [FromQuery] string lessonId)
        {
            var course = await _mongo.Courses.Find(x => x.Id == courseId).FirstOrDefaultAsync();
            if (course == null) return NotFound();

            var lesson = course.Lessons.FirstOrDefault(l => l.Id == lessonId);
            if (lesson == null) return NotFound();

            if (!string.IsNullOrEmpty(lesson.FilePath))
            {
                var fileFullPath = Path.Combine(_env.ContentRootPath, lesson.FilePath.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));
                if (System.IO.File.Exists(fileFullPath))
                    System.IO.File.Delete(fileFullPath);

                lesson.FilePath = null;
                var update = Builders<Course>.Update.Set(x => x.Lessons, course.Lessons);
                await _mongo.Courses.UpdateOneAsync(x => x.Id == courseId, update);
            }

            return Ok();
        }
    }
}