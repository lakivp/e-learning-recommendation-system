using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;
using web_bek.Dto;
using web_bek.Models;
using web_bek.Services;

namespace web_bek.Controllers
{
    [ApiController]
    [Route("api/user/dashboard")]
    [Authorize]
    public class UserDashboardController : ControllerBase
    {
        private readonly MongoDbService _mongo;


        public UserDashboardController(MongoDbService mongo)
        {
            _mongo = mongo;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var passedTests = await _mongo.TestSubmissions
            .Find(x => x.UserId == userId && x.Passed)
            .ToListAsync();

            var userCourses = await _mongo.UserCourses
                .Find(x => x.UserId == userId)
                .ToListAsync();

            var courseIds = userCourses.Select(x => x.CourseId).ToList();
            var courses = await _mongo.Courses
                .Find(c => courseIds.Contains(c.Id))
                .ToListAsync();

            int activeCourses =0;
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
                 var course = courses.First(c => c.Id == uc.CourseId);
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