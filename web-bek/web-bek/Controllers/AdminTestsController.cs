using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using web_bek.Services;

namespace web_bek.Controllers
{
    [ApiController]
    [Route("api/admin/tests")]
    [Authorize(Roles = "Admin")]
    public class AdminTestsController : ControllerBase
    {
        private readonly MongoDbService _db;

        public AdminTestsController(MongoDbService db)
        {
            _db = db;
        }

        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetTestByCourse(string courseId)
        {
            var test = await _db.CourseTest
                .Find(t => t.CourseId == courseId)
                .FirstOrDefaultAsync();

            return Ok(test);
        }

        [HttpDelete("{testId}")]
        public async Task<IActionResult> DeleteTest(string testId)
        {
            await _db.CourseTest.DeleteOneAsync(t => t.Id == testId);
            await _db.TestSubmissions.DeleteManyAsync(s => s.TestId == testId);

            return Ok();
        }
    }
}