using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;
using web_bek.Dto;
using web_bek.Models;
using web_bek.Services;

[ApiController]
[Route("api/user/progress")]
[Authorize]
public class UserProgressController : ControllerBase
{
    private readonly IMongoCollection<UserCourse> _userCourses;
    private readonly IMongoCollection<Comment> _comments;
    private readonly IMongoCollection<TestSubmission> _testSubmissions;
    private readonly MongoDbService _mongo;

    public UserProgressController(IMongoDatabase db, MongoDbService mongo)
    {
        _userCourses = db.GetCollection<UserCourse>("userCourses");
        _comments = db.GetCollection<Comment>("comments");
        _testSubmissions = db.GetCollection<TestSubmission>("testSubmissions");

        _mongo = mongo;

    }

    [HttpGet("summary")]
    public async Task<ProgressSummaryDto> GetSummary()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return new ProgressSummaryDto();

        var today = DateTime.UtcNow.Date;
        var weekAgo = today.AddDays(-7);

        var userCourses = await _userCourses
            .Find(x => x.UserId == userId)
            .ToListAsync();

        var completedLessonDates = userCourses
            .SelectMany(c => c.CompletedLessons)
            .Select(l => l.CompletedAt.Date)
            .ToList();

        return new ProgressSummaryDto
        {
            CompletedToday = completedLessonDates.Count(d => d == today),
            CompletedLast7Days = completedLessonDates.Count(d => d >= weekAgo)
        };
    }

    [HttpGet("heatmap")]
    public async Task<List<ActivityHeatmapDto>> GetHeatmap()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return new List<ActivityHeatmapDto>();

        var from = DateTime.UtcNow.Date.AddDays(-370);

        var enrollActivities = await _userCourses
            .Find(x => x.UserId == userId && x.EnrolledAt >= from)
            .Project(x => x.EnrolledAt)
            .ToListAsync();

        var lessonActivities = await _userCourses
            .Find(x => x.UserId == userId)
            .Project(x => x.CompletedLessons.Select(l => l.CompletedAt))
            .ToListAsync();

        var commentActivities = await _comments
            .Find(c => c.UserId == userId && c.CreatedAt >= from)
            .Project(c => c.CreatedAt)
            .ToListAsync();

        var testActivities = await _testSubmissions
            .Find(t =>
                t.UserId == userId &&
                t.Passed &&
                t.SubmittedAt >= from)
            .Project(t => t.SubmittedAt)
            .ToListAsync();

        var completedCourseActivities = await _userCourses
            .Find(x =>
                x.UserId == userId &&
                x.CompletedAt.HasValue &&
                x.CompletedAt.Value >= from)
            .Project(x => x.CompletedAt.Value)
            .ToListAsync();

        var allActivities =
            enrollActivities
            .Concat(lessonActivities.SelectMany(x => x))
            .Concat(commentActivities)
            .Concat(testActivities)
            .Concat(completedCourseActivities)
            .Where(d => d >= from);

        return allActivities
            .GroupBy(d => d.Date)
            .Select(g => new ActivityHeatmapDto
            {
                Date = g.Key,
                Count = g.Count()
            })
            .OrderBy(x => x.Date)
            .ToList();
    }

    [HttpGet("chart")]
    public async Task<List<LessonsChartDto>> GetLessonsChart()
    {
        var from = DateTime.UtcNow.Date.AddDays(-30);

        var completed = await _userCourses
            .Find(_ => true)
            .Project(x => x.CompletedLessons.Select(l => l.CompletedAt))
            .ToListAsync();

        return completed
            .SelectMany(x => x)
            .Where(d => d >= from)
            .GroupBy(d => d.Date)
            .Select(g => new LessonsChartDto
            {
                Date = g.Key,
                CompletedLessons = g.Count()
            })
            .OrderBy(x => x.Date)
            .ToList();
    }

    [HttpGet("activities-by-day")]
    public async Task<IActionResult> GetActivitiesByDay(DateTime date)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var dayStart = date.Date;
        var dayEnd = dayStart.AddDays(1);

        var testSubmissions = await _testSubmissions
        .Find(t =>
            t.UserId == userId &&
            t.Passed &&
            t.SubmittedAt >= dayStart &&
            t.SubmittedAt < dayEnd)
        .ToListAsync();

        var userCourses = await _mongo.UserCourses
            .Find(x => x.UserId == userId)
            .ToListAsync();

        if (!userCourses.Any())
            return Ok(new List<ActivityDto>());

        var courseIds = userCourses.Select(x => x.CourseId).Distinct().ToList();
        var courses = await _mongo.Courses
            .Find(c => courseIds.Contains(c.Id))
            .ToListAsync();

        var activities = new List<ActivityDto>();

        foreach (var uc in userCourses)
        {
            var course = courses.FirstOrDefault(c => c.Id == uc.CourseId);
            if (course == null) continue;

            if (uc.EnrolledAt >= dayStart && uc.EnrolledAt < dayEnd)
            {
                activities.Add(new ActivityDto
                {
                    Type = "enroll",
                    Text = $"Enrolled in \"{course.Title}\"",
                    Date = uc.EnrolledAt
                });
            }

            foreach (var completed in uc.CompletedLessons
                .Where(l => l.CompletedAt >= dayStart && l.CompletedAt < dayEnd))
            {
                var lesson = course.Lessons
                    .FirstOrDefault(l => l.Id == completed.LessonId);

                activities.Add(new ActivityDto
                {
                    Type = "lesson",
                    Text = lesson == null
                        ? $"Completed a lesson in \"{course.Title}\""
                        : $"Completed lesson \"{lesson.Name}\"",
                    Date = completed.CompletedAt
                });
            }
        }

        foreach (var t in testSubmissions)
        {
            var course1 = courses.FirstOrDefault(c => c.Id == t.CourseId);

            activities.Add(new ActivityDto
            {
                Type = "test",
                Text = $"Passed test for \"{course1?.Title}\"",
                Date = t.SubmittedAt
            });
        }

        foreach (var uc in userCourses)
        {
            if (uc.CompletedAt >= dayStart && uc.CompletedAt < dayEnd)
            {
                var course = courses.FirstOrDefault(c => c.Id == uc.CourseId);
                if (course == null) continue;

                activities.Add(new ActivityDto
                {
                    Type = "course",
                    Text = $"Completed course \"{course.Title}\"",
                    Date = uc.CompletedAt.Value
                });
            }
        }

        var comments = await _mongo.Comments
            .Find(c =>
                c.UserId == userId &&
                c.CreatedAt >= dayStart &&
                c.CreatedAt < dayEnd)
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

        return Ok(
            activities
                .OrderByDescending(a => a.Date)
                .ToList()
        );
    }


}