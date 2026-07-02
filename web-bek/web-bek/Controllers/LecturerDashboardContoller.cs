using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using web_bek.Dto;
using web_bek.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using web_bek.Dto;
using web_bek.Services;

namespace web_bek.Controllers
{
    [ApiController]
    [Route("api/lecturer/dashboard")]
    [Authorize]
    public class LecturerDashboardController : ControllerBase
    {
        private readonly MongoDbService _mongo;

        public LecturerDashboardController(MongoDbService mongo)
        {
            _mongo = mongo;
        }

        private string UserId =>
            User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        private string Role =>
            User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            if (Role != "Lecturer")
                return Forbid();

            // Kursevi predavača
            var courses = await _mongo.Courses
                .Find(c => c.LecturerId == UserId)
                .ToListAsync();

            var courseIds = courses.Select(c => c.Id).ToList();

            // Enrollments
            var enrollments = await _mongo.UserCourses
                .Find(e => courseIds.Contains(e.CourseId))
                .ToListAsync();

            var users = await _mongo.Users.Find(_ => true).ToListAsync();

            // TOP COURSES BY ENROLLED
            var topCourses = courses
                .Select(c => new CourseTopDto
                {
                    CourseId = c.Id,
                    Title = c.Title,
                    Students = enrollments.Count(e => e.CourseId == c.Id)
                })
                .Where(x => x.Students > 0)
                .OrderByDescending(x => x.Students)
                .Take(5)
                .ToList();

            // TOP COURSES BY COMPLETED
            var topCompleted = courses
                .Select(c => new TopCourseCompletedDto
                {
                    CourseId = c.Id,
                    Title = c.Title,
                    Completed = enrollments.Count(e => e.CourseId == c.Id && e.CompletedAt != null)
                })
                .Where(x => x.Completed > 0)
                .OrderByDescending(x => x.Completed)
                .Take(5)
                .ToList();

            // Enrollments table
            var enrollmentDtos = enrollments.Select(e =>
            {
                var user = users.FirstOrDefault(u => u.Id == e.UserId);
                var course = courses.First(c => c.Id == e.CourseId);

                return new LecturerEnrollmentDto
                {
                    Id = e.Id,
                    UserId = e.UserId,
                    Username = user?.Username ?? "Unknown",
                    CourseId = e.CourseId,
                    CourseName = course.Title,
                    EnrolledAt = e.EnrolledAt
                };
            }).ToList();

            var topCompletedUsers = enrollments
                .Where(e => e.CompletedAt != null)
                .GroupBy(e => e.UserId)
                .Select(g => new TopUserCompletedDto
                {
                    UserId = g.Key,
                    Username = users.FirstOrDefault(u => u.Id == g.Key)?.Username ?? "Unknown",
                    Completed = g.Count()
                })
                .Where(x=>x.Completed > 0)
                .OrderByDescending(x => x.Completed)
                .Take(5)
                .ToList();

            return Ok(new LecturerDashboardDto
            {
                TopCourses = topCourses,
                TopCompletedCourses = topCompleted,
                TopCompletedUsers = topCompletedUsers,
                Enrollments = enrollmentDtos
            });
        }

        [HttpDelete("enrollments/{id}")]
        public async Task<IActionResult> RemoveEnrollment(string id)
        {
            if (Role != "Lecturer")
                return Forbid();

            var enrollment = await _mongo.UserCourses.Find(e => e.Id == id).FirstOrDefaultAsync();
            if (enrollment == null)
                return NotFound();

            var course = await _mongo.Courses.Find(c => c.Id == enrollment.CourseId).FirstOrDefaultAsync();
            if (course.LecturerId != UserId)
                return Forbid();

            await _mongo.UserCourses.DeleteOneAsync(e => e.Id == id);
            return Ok();
        }
    }
}
