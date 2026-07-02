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
    [Route("api/user/tests")]
    [Authorize(Roles = "User")]
    public class UserTestsController : ControllerBase
    {
        private readonly MongoDbService _db;

        public UserTestsController(MongoDbService db)
        {
            _db = db;
        }

        private string UserId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetTestForUser(string courseId)
        {
            var userCourse = await _db.UserCourses
               .Find(x => x.UserId == UserId && x.CourseId == courseId)
               .FirstOrDefaultAsync();

            if (userCourse?.CompletedAt != null)
            {
                return Ok(new
                {
                    alreadyCompleted = true
                });
            }

            var test = await _db.CourseTest
                .Find(t => t.CourseId == courseId)
                .FirstOrDefaultAsync();

            if (test == null)
                return NotFound();

            var dto = new UserTestViewDto
            {
                TestId = test.Id,
                Title = test.Title,
                RequiredCorrect = test.RequiredCorrect,
                DurationMinutes = test.DurationMinutes,
                Questions = test.Questions.Select(q => new UserQuestionDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    Answers = q.Options.Select((opt, index) => new UserAnswerDto
                    {
                        Id = index.ToString(),  
                        Text = opt
                    }).ToList()
                }).ToList()
            };

            return Ok(dto);
        }

        [HttpPost("{testId}/submit")]
        public async Task<IActionResult> SubmitTest(string testId, [FromBody] SolveTestDto dto)
        {

            var test = await _db.CourseTest
                .Find(t => t.Id == testId)
                .FirstOrDefaultAsync();

            if (test == null)
                return NotFound();

            var userCourse = await _db.UserCourses
                .Find(x => x.UserId == UserId && x.CourseId == test.CourseId)
                .FirstOrDefaultAsync();

            if (userCourse?.CompletedAt != null)
                return BadRequest("Course already completed");

            var alreadyPassed = await _db.TestSubmissions
                .Find(s =>
                    s.TestId == testId &&
                    s.UserId == UserId &&
                    s.Passed == true
                )
                .AnyAsync();

            if (alreadyPassed)
                return BadRequest("You have already passed this test");

            int correct = 0;

            foreach (var q in test.Questions)
            {
                if (dto.Answers.TryGetValue(q.Id, out string answerId))
                {
                    if (answerId == q.CorrectIndex.ToString())
                        correct++;
                }
            }

            bool passed = correct >= test.RequiredCorrect;

            var submission = new TestSubmission
            {
                TestId = test.Id,
                CourseId = test.CourseId,
                UserId = UserId,
                Score = correct,
                Passed = passed
            };

            await _db.TestSubmissions.InsertOneAsync(submission);

            if (passed)
            {                
                if (userCourse != null && userCourse.CompletedAt == null)
                {
                    userCourse.CompletedAt = submission.SubmittedAt;

                    await _db.UserCourses.ReplaceOneAsync(
                        x => x.Id == userCourse.Id,
                        userCourse
                    );
                }
            }
            return Ok(new
            {
                correct,
                required = test.RequiredCorrect,
                passed
            });
        }

        [HttpGet("{testId}/status")]
        public async Task<IActionResult> GetTestStatus(string testId)
        {
            var passed = await _db.TestSubmissions
                .Find(x =>
                    x.TestId == testId &&
                    x.UserId == UserId &&
                    x.Passed == true
                )
                .AnyAsync();

            return Ok(new
            {
                passed
            });
        }

        [HttpGet("course/{courseId}/course-status")]
        public async Task<IActionResult> GetCourseStatus(string courseId)
        {
            var userCourse = await _db.UserCourses
                .Find(x => x.UserId == UserId && x.CourseId == courseId)
                .FirstOrDefaultAsync();

            if (userCourse == null)
                return NotFound();

            return Ok(new
            {
                completed = userCourse.CompletedAt != null,
                completedAt = userCourse.CompletedAt
            });
        }
    }
}