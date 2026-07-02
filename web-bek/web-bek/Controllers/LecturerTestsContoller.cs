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
    [Route("api/lecturer/tests")]
    [Authorize(Roles = "Lecturer")]
    public class LecturerTestsController : ControllerBase
    {
        private readonly MongoDbService _db;

        public LecturerTestsController(MongoDbService db)
        {
            _db = db;
        }

        private string LecturerId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)!;


        [HttpPost]
        public async Task<IActionResult> CreateTest([FromBody] CreateCourseTestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CourseId))
                return BadRequest("CourseId is required");

            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest("Title is required");

            if (dto.Questions == null || dto.Questions.Count == 0)
                return BadRequest("Test must have at least one question");

            var questions = new List<TestQuestion>();

            foreach (var q in dto.Questions)
            {
                if (string.IsNullOrWhiteSpace(q.Text))
                    return BadRequest("Question text is required");

                if (q.Options == null || q.Options.Count < 2)
                    return BadRequest("Each question must have at least 2 options");

                if (q.CorrectIndex < 0 || q.CorrectIndex >= q.Options.Count)
                    return BadRequest("CorrectIndex is out of range");

                questions.Add(new TestQuestion
                {
                    Text = q.Text,
                    Options = q.Options,
                    CorrectIndex = q.CorrectIndex
                });
            }

            if (dto.RequiredCorrect <= 0)
                return BadRequest("RequiredCorrect must be greater than 0");

            if (dto.RequiredCorrect > questions.Count)
                return BadRequest("RequiredCorrect cannot be greater than number of questions");

            if (dto.DurationMinutes <= 0)
                return BadRequest("DurationMinutes must be greater than 0");

            var test = new CourseTest
            {
                CourseId = dto.CourseId,
                Title = dto.Title,
                LecturerId = LecturerId,
                Questions = questions,
                RequiredCorrect = dto.RequiredCorrect,
                DurationMinutes = dto.DurationMinutes
            };

            await _db.CourseTest.InsertOneAsync(test);
            return Ok(test);
        }


        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetTestByCourse(string courseId)
        {
            var test = await _db.CourseTest
                .Find(t => t.CourseId == courseId && t.LecturerId == LecturerId)
                .FirstOrDefaultAsync();

            if (test == null) return NotFound();
            return Ok(test);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTest(string id, [FromBody] CreateCourseTestDto dto)
        {
            var test = await _db.CourseTest
                .Find(t => t.Id == id && t.LecturerId == LecturerId)
                .FirstOrDefaultAsync();

            if (test == null)
                return NotFound();

            test.Title = dto.Title;

            if (dto.RequiredCorrect <= 0)
                return BadRequest("RequiredCorrect must be greater than 0");

            if (dto.RequiredCorrect > test.Questions.Count)
                return BadRequest("RequiredCorrect cannot be greater than number of questions");
            if(dto.DurationMinutes <= 0)
                return BadRequest("DurationMinutes must be greater than 0");


            test.RequiredCorrect = dto.RequiredCorrect;
            test.DurationMinutes = dto.DurationMinutes;

            await _db.CourseTest.ReplaceOneAsync(t => t.Id == id, test);
            return Ok(test);
        }

        // ========================= DELETE TEST =========================

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTest(string id)
        {
            await _db.CourseTest.DeleteOneAsync(
                t => t.Id == id && t.LecturerId == LecturerId
            );

            await _db.TestSubmissions.DeleteManyAsync(s => s.TestId == id);
            return Ok();
        }

        // ========================= QUESTIONS =========================

        [HttpPost("{testId}/questions")]
        public async Task<IActionResult> AddQuestion(string testId, [FromBody] TestQuestionDto dto)
        {
            if (dto.Options.Count < 2)
                return BadRequest("At least 2 options required");

            if (dto.CorrectIndex < 0 || dto.CorrectIndex >= dto.Options.Count)
                return BadRequest("CorrectIndex is out of range");

            var question = new TestQuestion
            {
                Text = dto.Text,
                Options = dto.Options,
                CorrectIndex = dto.CorrectIndex
            };

            var update = Builders<CourseTest>.Update.Push(t => t.Questions, question);

            await _db.CourseTest.UpdateOneAsync(
                t => t.Id == testId && t.LecturerId == LecturerId,
                update
            );

            return Ok(question);
        }

        [HttpDelete("{testId}/questions/{questionId}")]
        public async Task<IActionResult> DeleteQuestion(string testId, string questionId)
        {
            var update = Builders<CourseTest>.Update
                .PullFilter(t => t.Questions, q => q.Id == questionId);

            await _db.CourseTest.UpdateOneAsync(
                t => t.Id == testId && t.LecturerId == LecturerId,
                update
            );

            return Ok();
        }


        [HttpGet("{testId}/submissions")]
        public async Task<IActionResult> GetSubmissions(string testId)
        {
            var subs = await _db.TestSubmissions
                .Find(s => s.TestId == testId)
                .ToListAsync();

            return Ok(subs);
        }

        [HttpPut("submissions/{id}/review")]
        public async Task<IActionResult> ReviewSubmission(string id, [FromQuery] bool passed)
        {
            var update = Builders<TestSubmission>.Update
                .Set(s => s.Passed, passed)
                .Set(s => s.ReviewedByLecturer, true);

            await _db.TestSubmissions.UpdateOneAsync(s => s.Id == id, update);
            return Ok();
        }
    }
}