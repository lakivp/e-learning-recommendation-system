using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using web_bek.Dto;
using web_bek.Services;

namespace web_bek.Controllers
{
    [ApiController]
    [Route("api/admin/activity")]
    [Authorize]
    public class AdminActivityController : ControllerBase
    {
        private readonly MongoDbService _mongo;

        public AdminActivityController(MongoDbService mongo)
        {
            _mongo = mongo;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _mongo.Users
                .Find(x => x.Role == "User")
                .Project(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("heatmap/{userId}")]
        public async Task<List<ActivityHeatmapDto>> GetUserHeatmap(string userId)
        {
            var from = DateTime.UtcNow.Date.AddDays(-370);

            var lessonDates = await _mongo.UserCourses
                .Find(x => x.UserId == userId)
                .Project(x => x.CompletedLessons.Select(l => l.CompletedAt))
                .ToListAsync();

            var commentDates = await _mongo.Comments
                .Find(c => c.UserId == userId)
                .Project(c => c.CreatedAt)
                .ToListAsync();

            var enrollDates = await _mongo.UserCourses
                .Find(x => x.UserId == userId)
                .Project(x => x.EnrolledAt)
                .ToListAsync();

            var testDates = await _mongo.TestSubmissions
                .Find(t => t.UserId == userId && t.Passed)
                .Project(t => t.SubmittedAt)
                .ToListAsync();

            var completedCourseDates = await _mongo.UserCourses
                .Find(x =>
                    x.UserId == userId &&
                    x.CompletedAt.HasValue &&
                    x.CompletedAt.Value >= from)
                .Project(x => x.CompletedAt.Value)
                .ToListAsync();

            var all = lessonDates.SelectMany(x => x)
                .Concat(commentDates)
                .Concat(enrollDates)
                .Concat(testDates)
                .Concat(completedCourseDates)
                .Where(d => d >= from);

            return all
                .GroupBy(d => d.Date)
                .Select(g => new ActivityHeatmapDto
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .ToList();
        }

        //poslednjih 5 aktivnosti korisnika
        [HttpGet("recent/{userId}")]
        public async Task<IActionResult> GetDashboardForUser(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest("UserId is required");

            var userCourses = await _mongo.UserCourses
                .Find(x => x.UserId == userId)
                .ToListAsync();

            var passedTests = await _mongo.TestSubmissions
                .Find(t => t.UserId == userId && t.Passed)
                .ToListAsync();

            var courseIds = userCourses.Select(x => x.CourseId).ToList();
            var courses = await _mongo.Courses
                .Find(c => courseIds.Contains(c.Id))
                .ToListAsync();

            int activeCourses = 0;
            int completedCourses = 0;
            int completedLessons = 0;
            int totalLessons = 0;

            var activities = new List<ActivityDto>();

            foreach (var uc in userCourses)
            {
                var course = courses.First(c => c.Id == uc.CourseId);

                totalLessons += course.Lessons.Count;
                completedLessons += uc.CompletedLessons.Count;

                activities.Add(new ActivityDto
                {
                    Type = "enroll",
                    Text = $"Enrolled in \"{course.Title}\"",
                    Date = uc.EnrolledAt
                });

                foreach (var completed in uc.CompletedLessons)
                {
                    var lesson = course.Lessons.FirstOrDefault(l => l.Id == completed.LessonId);
                    if (lesson == null) continue;

                    activities.Add(new ActivityDto
                    {
                        Type = "lesson",
                        Text = $"Completed lesson \"{lesson.Name}\"",
                        Date = completed.CompletedAt
                    });
                }

                bool isCompleted = uc.CompletedAt != null;

                if (isCompleted)
                {
                    completedCourses++;

                    activities.Add(new ActivityDto
                    {
                        Type = "course",
                        Text = $"Completed course \"{course.Title}\"",
                        Date = uc.CompletedAt.Value
                    });
                }
                else
                {
                    activeCourses++;
                }
            }

            foreach (var t in passedTests)
            {
                var course = courses.FirstOrDefault(c => c.Id == t.CourseId);
                if (course == null) continue;

                activities.Add(new ActivityDto
                {
                    Type = "test",
                    Text = $"Passed test for \"{course.Title}\"",
                    Date = t.SubmittedAt
                });
            }

            var comments = await _mongo.Comments
                .Find(c => c.UserId == userId)
                .SortByDescending(c => c.CreatedAt)
                .Limit(5)
                .ToListAsync();

            foreach (var c in comments)
            {
                var course = courses.FirstOrDefault(x => x.Id == c.CourseId);
                activities.Add(new ActivityDto
                {
                    Type = "comment",
                    Text = $"Commented on \"{course?.Title}\": \"{c.Text}\"",
                    Date = c.CreatedAt
                });
            }

            var recentActivity = activities
                .OrderByDescending(a => a.Date)
                .Take(5)
                .ToList();

            var continueLearning = userCourses
                .Where(uc =>
                {
                    return uc.CompletedAt == null;
                })
                .Select(uc =>
                {
                    var course = courses.First(c => c.Id == uc.CourseId);
                    return new
                    {
                        course.Id,
                        course.Title,
                        Progress = course.Lessons.Count > 0
                            ? (int)((double)uc.CompletedLessons.Count / course.Lessons.Count * 100)
                            : 0
                    };
                })
                .ToList();

            return Ok(new
            {
                Stats = new
                {
                    activeCourses,
                    completedCourses,
                    completedLessons,
                    totalLessons
                },
                ContinueLearning = continueLearning,
                RecentActivity = recentActivity
            });
        }

    }

   
}
