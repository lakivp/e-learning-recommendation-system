using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using web_bek.Dto;
using web_bek.Models;
using web_bek.Services;

namespace web_bek.Controllers
{
    [ApiController]
    [Route("api/admin/enrollments")]
    [Authorize]
    public class AdminEnrollmentsController : ControllerBase
    {
        private readonly MongoDbService _mongo;
        public AdminEnrollmentsController(MongoDbService mongo)
        {
            _mongo = mongo;
        }

        [HttpGet]
        public async Task<IActionResult> GetEnrollments()
        {
            var enrollments = await _mongo.UserCourses
                .Find(_ => true)
                .SortByDescending(e => e.EnrolledAt)
                .ToListAsync();

            var users = await _mongo.Users.Find(_ => true).ToListAsync();
            var courses = await _mongo.Courses.Find(_ => true).ToListAsync();

            var result = enrollments.Select(e => new EnrollmentDto
            {
                Id = e.Id,
                Username = users.FirstOrDefault(u => u.Id == e.UserId)?.Username ?? "Unknown",
                CourseName = courses.FirstOrDefault(c => c.Id == e.CourseId)?.Title ?? "Unknown",
                EnrolledAt = e.EnrolledAt
            }).ToList();

            return Ok(new
            {
                enrollments = result,
                totalCount = result.Count
            });
        }

        // DELETE enrollment (odjavi korisnika)
        [HttpDelete("{enrollmentId}")]
        public async Task<IActionResult> DeleteEnrollment(string enrollmentId)
        {
            var deleteResult = await _mongo.UserCourses.DeleteOneAsync(x => x.Id == enrollmentId);
            if (deleteResult.DeletedCount == 0)
                return NotFound(new { message = "Enrollment not found" });

            return Ok(new { message = "Enrollment deleted" });
        }
    }
}