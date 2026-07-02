using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using web_bek.Dto;
using web_bek.Models;
using web_bek.Services;

namespace web_bek.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly MongoDbService _mongo;

        public AdminController(MongoDbService mongo)
        {
            _mongo = mongo;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var users = await _mongo.Users.Find(x => x.Role == "User" || x.Role == "Lecturer").ToListAsync();

            var totalUsers = users.Count;
            var activeUsers = users.Count(x => x.IsActive);
            var disabledUsers = users.Count(x => !x.IsActive);
            var newUsersToday = users.Count(x => x.CreatedAt.Date == DateTime.UtcNow.Date);

            var passedTests = await _mongo.TestSubmissions
            .Find(x => x.Passed)
            .ToListAsync();

            var recentUsers = users
                .OrderByDescending(x => x.CreatedAt)
                .Take(10)
                .Select(x => new UserSummaryDto
                {
                    Username = x.Username,
                    Email = x.Email,
                    Role = x.Role,
                    IsActive = x.IsActive,
                    CreatedAt = x.CreatedAt
                }).ToList();

            var stats = new List<RegistrationStatDto>();
            for (int i = 6; i >= 0; i--)
            {
                var date = DateTime.UtcNow.Date.AddDays(-i);
                var count = users.Count(x => x.CreatedAt.Date == date);

                stats.Add(new RegistrationStatDto
                {
                    Date = date.ToString("dd.MM"),
                    Count = count
                });
            }

            var userCourses = await _mongo.UserCourses.Find(_ => true).ToListAsync();
            var courses = await _mongo.Courses.Find(_ => true).ToListAsync();

            var topUsers = userCourses
                .GroupBy(x => x.UserId)
                .Select(g => new { UserId = g.Key, Courses = g.Count() })
                .OrderByDescending(x => x.Courses)
                .Take(5)
                .ToList();

            var topUsersList = users
                .Where(u => topUsers.Select(t => t.UserId).Contains(u.Id))
                .Select(u =>
                {
                    var count = topUsers.FirstOrDefault(t => t.UserId == u.Id)?.Courses ?? 0;
                    return new TopUserDto
                    {
                        Username = u.Username,
                        Courses = count
                    };
                })
                .OrderByDescending(u => u.Courses)
                .ToList();

            var topCourses = userCourses
                .GroupBy(x => x.CourseId)
                .Select(g => new { CourseId = g.Key, Students = g.Count() })
                .OrderByDescending(x => x.Students)
                .Take(5)
                .ToList();

            var resultTopCourses = topCourses
                .Select(x => new TopCourseDto
                {
                    Title = courses.FirstOrDefault(c => c.Id == x.CourseId)?.Title ?? "Unknown",
                    Students = x.Students
                })
                .ToList();

            var topCompletedUsers = users
                .Select(u =>
                {
                    int completedCoursesCount = passedTests
                        .Where(t => t.UserId == u.Id)
                        .Select(t => t.CourseId)
                        .Distinct()
                        .Count();

                    return new TopCompletedUserDto
                    {
                        Username = u.Username,
                        Completed = completedCoursesCount
                    };
                })
                .Where(x => x.Completed > 0)
                .OrderByDescending(x => x.Completed)
                .Take(5)
                .ToList();

            var dashboard = new AdminDashboardDto
            {
                TotalUsers = totalUsers,
                ActiveUsers = activeUsers,
                DisabledUsers = disabledUsers,
                NewUsersToday = newUsersToday,
                RecentUsers = recentUsers,
                RegistrationStats = stats,
                TopUsers = topUsersList,
                TopCourses = resultTopCourses,
                TopCompletedUsers = topCompletedUsers
            };

            return Ok(dashboard);
        }

        [HttpGet("lecturer-requests")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetLecturerRequests()
        {
            var users = await _mongo.Users
                .Find(u => u.WantsToBeLecturer && !u.LecturerApproved)
                .Project(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPost("lecturer-requests/{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveLecturer(string id)
        {
            var filter = Builders<User>.Filter.Eq(x => x.Id, id);

            var update = Builders<User>.Update
                .Set(x => x.Role, "Lecturer")
                .Set(x => x.LecturerApproved, true);

            var result = await _mongo.Users.UpdateOneAsync(filter, update);

            if (result.MatchedCount == 0)
                return NotFound();

            return Ok();
        }

        [HttpPost("lecturer-requests/{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectLecturer(string id)
        {
            var filter = Builders<User>.Filter.Eq(x => x.Id, id);

            var update = Builders<User>.Update
                .Set(x => x.WantsToBeLecturer, false)
                .Set(x => x.LecturerApproved, false);

            var result = await _mongo.Users.UpdateOneAsync(filter, update);

            if (result.MatchedCount == 0)
                return NotFound();

            return Ok();
        }


    }
}