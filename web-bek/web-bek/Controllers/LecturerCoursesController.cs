namespace web_bek.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using MongoDB.Bson;
    using MongoDB.Driver;
    using web_bek.Dto;
    using web_bek.Models;
    using web_bek.Services;
    using System.Security.Claims;

    [ApiController]
    [Route("api/lecturer/courses")]
    [Authorize]
    public class LecturerCoursesController : ControllerBase
    {
        private readonly MongoDbService _mongo;
        private readonly IWebHostEnvironment _env;

        public LecturerCoursesController(MongoDbService mongo, IWebHostEnvironment env)
        {
            _mongo = mongo;
            _env = env;
        }

        private string UserId =>
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        private string Role =>
            User.FindFirst(ClaimTypes.Role)?.Value;

        [HttpGet]
        public async Task<IActionResult> GetMyCourses()
        {
            if (Role != "Lecturer")
                return Forbid();

            var courses = await _mongo.Courses
                .Find(c => c.LecturerId == UserId)
                .ToListAsync();

            return Ok(courses);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCourse(CreateCourseDto dto)
        {
            if (Role != "Lecturer")
                return Forbid();

            var course = new Course
            {
                Id = ObjectId.GenerateNewId().ToString(),
                Title = dto.Title,
                Description = dto.Description,
                LecturerId = UserId
            };

            await _mongo.Courses.InsertOneAsync(course);
            return Ok(course);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateCourse(UpdateCourseDto dto)
        {
            if (Role != "Lecturer")
                return Forbid();

            var course = await _mongo.Courses
                .Find(c => c.Id == dto.Id && c.LecturerId == UserId)
                .FirstOrDefaultAsync();

            if (course == null)
                return Forbid();

            var update = Builders<Course>.Update
                .Set(x => x.Title, dto.Title)
                .Set(x => x.Description, dto.Description);

            await _mongo.Courses.UpdateOneAsync(x => x.Id == dto.Id, update);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(string id)
        {
            if (Role != "Lecturer")
                return Forbid();

            var result = await _mongo.Courses.DeleteOneAsync(
                c => c.Id == id && c.LecturerId == UserId
            );

            if (result.DeletedCount == 0)
                return Forbid();

            await _mongo.Comments.DeleteManyAsync(c => c.CourseId == id);
            await _mongo.UserCourses.DeleteManyAsync(uc => uc.CourseId == id);

            return Ok();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCourse(string id)
        {
            if (Role != "Lecturer")
                return Forbid();

            var course = await _mongo.Courses
                .Find(c => c.Id == id && c.LecturerId == UserId)
                .FirstOrDefaultAsync();

            if (course == null)
                return Forbid();

            return Ok(course);
        }

        [HttpPost("lesson")]
        public async Task<IActionResult> AddLesson([FromForm] CreateLessonFormDto dto)
        {
            if (Role != "Lecturer")
                return Forbid();

            var course = await _mongo.Courses
                .Find(c => c.Id == dto.CourseId && c.LecturerId == UserId)
                .FirstOrDefaultAsync();

            if (course == null)
                return Forbid();

            var lesson = new Lesson
            {
                Id = Guid.NewGuid().ToString(),
                CourseId = dto.CourseId,
                Name = dto.Name,
                Text = dto.Text
            };

            if (dto.File != null && dto.File.Length > 0)
            {
                var uploads = Path.Combine(_env.ContentRootPath, "Uploads");
                if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);

                var fileName = $"{Path.GetFileNameWithoutExtension(dto.File.FileName)}_{DateTime.Now.Ticks}{Path.GetExtension(dto.File.FileName)}";
                var filePath = Path.Combine(uploads, fileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await dto.File.CopyToAsync(stream);

                lesson.FilePath = "/uploads/" + fileName;
            }

            course.Lessons.Add(lesson);

            await _mongo.Courses.UpdateOneAsync(
                c => c.Id == dto.CourseId,
                Builders<Course>.Update.Set(x => x.Lessons, course.Lessons)
            );

            return Ok(lesson);
        }

        [HttpPut("lesson")]
        public async Task<IActionResult> UpdateLesson(UpdateLessonDto dto)
        {
            if (Role != "Lecturer")
                return Forbid();

            var course = await _mongo.Courses
                .Find(c => c.Id == dto.CourseId && c.LecturerId == UserId)
                .FirstOrDefaultAsync();

            if (course == null)
                return Forbid();

            var lesson = course.Lessons.FirstOrDefault(l => l.Id == dto.LessonId);
            if (lesson == null)
                return NotFound();

            lesson.Name = dto.Name;
            lesson.Text = dto.Text;

            await _mongo.Courses.UpdateOneAsync(
                c => c.Id == dto.CourseId,
                Builders<Course>.Update.Set(x => x.Lessons, course.Lessons)
            );

            return Ok();
        }

        [HttpDelete("lesson")]
        public async Task<IActionResult> DeleteLesson(
            [FromQuery] string courseId,
            [FromQuery] string lessonId)
        {
            if (Role != "Lecturer")
                return Forbid();

            var course = await _mongo.Courses
                .Find(c => c.Id == courseId && c.LecturerId == UserId)
                .FirstOrDefaultAsync();

            if (course == null)
                return Forbid();

            course.Lessons = course.Lessons
                .Where(l => l.Id != lessonId)
                .ToList();

            await _mongo.Courses.UpdateOneAsync(
                c => c.Id == courseId,
                Builders<Course>.Update.Set(x => x.Lessons, course.Lessons)
            );

            return Ok();
        }

        [HttpPost("lesson/upload")]
        public async Task<IActionResult> UploadLessonFile(
                [FromForm] IFormFile file,
                [FromForm] string courseId,
                [FromForm] string lessonId)
        {
            if (Role != "Lecturer")
                return Forbid();

            var course = await _mongo.Courses
                .Find(c => c.Id == courseId && c.LecturerId == UserId)
                .FirstOrDefaultAsync();

            if (course == null)
                return Forbid();

            var lesson = course.Lessons.FirstOrDefault(l => l.Id == lessonId);
            if (lesson == null)
                return NotFound();

            var uploads = Path.Combine(_env.ContentRootPath, "Uploads");
            if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);

            var fileName = $"{Path.GetFileNameWithoutExtension(file.FileName)}_{DateTime.Now.Ticks}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploads, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            lesson.FilePath = "/uploads/" + fileName;

            await _mongo.Courses.UpdateOneAsync(
                c => c.Id == courseId,
                Builders<Course>.Update.Set(x => x.Lessons, course.Lessons)
            );

            return Ok();
        }

        [HttpDelete("lesson/file")]
        public async Task<IActionResult> DeleteLessonFile(
            [FromQuery] string courseId,
            [FromQuery] string lessonId)
        {
            if (Role != "Lecturer")
                return Forbid();

            var course = await _mongo.Courses
                .Find(c => c.Id == courseId && c.LecturerId == UserId)
                .FirstOrDefaultAsync();

            if (course == null)
                return Forbid();

            var lesson = course.Lessons.FirstOrDefault(l => l.Id == lessonId);
            if (lesson == null)
                return NotFound();

            if (!string.IsNullOrEmpty(lesson.FilePath))
            {
                var fullPath = Path.Combine(
                    _env.ContentRootPath,
                    lesson.FilePath.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString())
                );

                if (System.IO.File.Exists(fullPath))
                    System.IO.File.Delete(fullPath);

                lesson.FilePath = null;
            }

            await _mongo.Courses.UpdateOneAsync(
                c => c.Id == courseId,
                Builders<Course>.Update.Set(x => x.Lessons, course.Lessons)
            );

            return Ok();
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
            if (Role != "Lecturer")
                return Forbid();

            var comment = await _mongo.Comments
                .Find(c => c.Id == id)
                .FirstOrDefaultAsync();

            if (comment == null)
                return NotFound();

            var course = await _mongo.Courses
                .Find(c => c.Id == comment.CourseId && c.LecturerId == UserId)
                .FirstOrDefaultAsync();

            if (course == null)
                return Forbid();

            await _mongo.Comments.DeleteOneAsync(c => c.Id == id);

            return Ok();
        }


    }
}
