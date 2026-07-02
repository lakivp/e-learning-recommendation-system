using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using web_bek.Dto;
using web_bek.Models;
using web_bek.Services;
using System.IO;
using System.Security.Claims;

namespace web_bek.Controllers
{
    [ApiController]
    [Route("api/user/courses")]
    [Authorize]
    public class UserCoursesController : ControllerBase
    {
        private readonly MongoDbService _mongo;
        private readonly IWebHostEnvironment _env;

        public UserCoursesController(MongoDbService mongo, IWebHostEnvironment env)
        {
            _mongo = mongo;
            _env = env;
        }

        [HttpPost("{courseId}/enroll")]
        public async Task<IActionResult> Enroll(string courseId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var exists = await _mongo.UserCourses
                .Find(x => x.UserId == userId && x.CourseId == courseId)
                .AnyAsync();

            if (exists)
                return BadRequest(new { message = "Already enrolled" });

            await _mongo.UserCourses.InsertOneAsync(new UserCourse
            {
                UserId = userId,
                CourseId = courseId
            });

            return Ok();
        }


        [HttpGet("browse")]
        public async Task<IActionResult> BrowseCourses()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var courses = await _mongo.Courses.Find(_=> true).ToListAsync();

            var enrolledCourseIds = await _mongo.UserCourses
                .Find(x => x.UserId == userId)
                .Project(x => x.CourseId)
                .ToListAsync();

            var result = courses.Select(c => new BrowseCourseDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                IsEnrolled = enrolledCourseIds.Contains(c.Id)
            }).ToList();

            return Ok(result);
        }


        [HttpGet("my")]
        public async Task<IActionResult> MyCourses()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var userCourses = await _mongo.UserCourses
                .Find(x => x.UserId == userId)
                .ToListAsync();

            var courseIds = userCourses.Select(x => x.CourseId).ToList();

            var courses = await _mongo.Courses
                .Find(c => courseIds.Contains(c.Id))
                .ToListAsync();

            var passedTests = await _mongo.TestSubmissions
                .Find(x => x.UserId == userId && x.Passed)
                .ToListAsync();

            var result = userCourses.Select(uc =>
            {
                var course = courses.First(c => c.Id == uc.CourseId);

                int totalLessons = course.Lessons?.Count ?? 0;
                int completedLessons = uc.CompletedLessons?.Count ?? 0;

                bool isCompleted = uc.CompletedAt != null;

                return new MyCourseDto
                {
                    CourseId = course.Id,
                    Title = course.Title,
                    Description = course.Description,
                    CompletedLessons = completedLessons,
                    TotalLessons = totalLessons,
                    IsCompleted = isCompleted
                };
            }).ToList();

            return Ok(result);
        }

        [HttpGet("{courseId}")]
        public async Task<IActionResult> GetCourseWithLessons(string courseId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var userCourse = await _mongo.UserCourses
                .Find(x => x.UserId == userId && x.CourseId == courseId)
                .FirstOrDefaultAsync();

            if (userCourse == null) return Forbid();

            var course = await _mongo.Courses
                .Find(x => x.Id == courseId)
                .FirstOrDefaultAsync();

            if (course == null) return NotFound();

            var result = new
            {
                id = course.Id,
                title = course.Title,
                description = course.Description,
                lessons = (course.Lessons ?? new List<Lesson>()).Select((l, index) => new
                {
                    id = l.Id,
                    number = index + 1,
                    name = l.Name,
                    text = l.Text,
                    filePath = !string.IsNullOrEmpty(l.FilePath)
                               ? $"/api/user/courses/lesson/download?fileName={l.FilePath}"
                               : null,
                    //isCompleted = userCourse.CompletedLessonIds.Contains(l.Id)
                    isCompleted = userCourse.CompletedLessons.Any(cl => cl.LessonId == l.Id),
                    isLocked = userCourse.CompletedAt != null
                         && !userCourse.CompletedLessons.Any(cl => cl.LessonId == l.Id)
                }).ToList()
            };

            return Ok(result);
        }

        [HttpPost("{courseId}/lesson/{lessonId}/complete")]
        public async Task<IActionResult> CompleteLesson(string courseId, string lessonId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var userCourse = await _mongo.UserCourses
                .Find(x => x.UserId == userId && x.CourseId == courseId)
                .FirstOrDefaultAsync();

            if (userCourse == null)
                return NotFound();

            if (userCourse.CompletedLessons.Any(x => x.LessonId == lessonId))
                return Ok();

            userCourse.CompletedLessons.Add(new CompletedLessonInfo
            {
                LessonId = lessonId,
                CompletedAt = DateTime.UtcNow
            });

            await _mongo.UserCourses.ReplaceOneAsync(
                x => x.Id == userCourse.Id,
                userCourse
            );

            return Ok();
        }

        [HttpGet("lesson/download")]
        public IActionResult DownloadLessonFile([FromQuery] string fileName)
        {
            if (string.IsNullOrEmpty(fileName)) return BadRequest();

            var uploadsPath = Path.Combine(_env.ContentRootPath, "Uploads");
            var fullPath = Path.Combine(uploadsPath, fileName);

            if (!System.IO.File.Exists(fullPath)) return NotFound();

            var bytes = System.IO.File.ReadAllBytes(fullPath);
            return File(bytes, "application/octet-stream", fileName);
        }

        [HttpGet("{courseId}/comments")]
        public async Task<IActionResult> GetComments(string courseId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var comments = await _mongo.Comments
                .Find(x => x.CourseId == courseId)
                .SortByDescending(x => x.CreatedAt)
                .ToListAsync();

            var userIds = comments.Select(c => c.UserId).Distinct().ToList();
            var users = await _mongo.Users.Find(u => userIds.Contains(u.Id)).ToListAsync();

            var result = comments.Select(c => new CommentViewDto
            {
                Id = c.Id,
                CourseId = c.CourseId,
                UserId = c.UserId,
                UserName = users.First(u => u.Id == c.UserId).Username,
                Text = c.Text,
                CreatedAt = c.CreatedAt,
                IsMine = c.UserId == userId
            }).ToList();

            return Ok(result);
        }

        [HttpPost("{courseId}/comments")]
        public async Task<IActionResult> AddComment(string courseId, CreateCommentDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _mongo.Users.Find(u => u.Id == userId).FirstAsync();

            var comment = new Comment
            {
                Id = Guid.NewGuid().ToString(),
                CourseId = courseId,
                UserId = userId,
                Text = dto.Text,
                CreatedAt = DateTime.UtcNow
            };

            await _mongo.Comments.InsertOneAsync(comment);

            return Ok(new CommentViewDto
            {
                Id = comment.Id,
                CourseId = comment.CourseId,
                UserId = userId,
                UserName = user.Username,
                Text = comment.Text,
                CreatedAt = comment.CreatedAt,
                IsMine = true
            });
        }

        [HttpPut("comments/{commentId}")]
        public async Task<IActionResult> EditComment(string commentId, CreateCommentDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var filter = Builders<Comment>.Filter.Where(
                c => c.Id == commentId && c.UserId == userId
            );

            var update = Builders<Comment>.Update
                .Set(c => c.Text, dto.Text)
                .Set(c => c.CreatedAt, DateTime.UtcNow);

            var result = await _mongo.Comments.UpdateOneAsync(filter, update);
            if (result.MatchedCount == 0) return Forbid();

            return Ok();
        }

        [HttpDelete("comments/{commentId}")]
        public async Task<IActionResult> DeleteComment(string commentId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await _mongo.Comments.DeleteOneAsync(
                c => c.Id == commentId && c.UserId == userId
            );

            if (result.DeletedCount == 0) return Forbid();

            return Ok();
        }
    }
}