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
    [Route("api/user/recommendations")]
    [Authorize]
    public class RecommendationController : ControllerBase
    {
        private readonly MongoDbService _db;
        private readonly HttpClient _http;

        public RecommendationController(MongoDbService db, IHttpClientFactory factory)
        {
            _db = db;
            _http = factory.CreateClient();
        }

        [HttpGet]
        public async Task<IActionResult> GetRecommendations()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var courses = await _db.Courses.Find(_ => true).ToListAsync();
            var completedCourseIds = await _db.UserCourses
                .Find(x => x.UserId == userId && x.CompletedAt != null)
                .Project(x => x.CourseId)
                .ToListAsync();
            var enrolledCourseIds = await _db.UserCourses
                .Find(x => x.UserId == userId && x.CompletedAt == null)
                .Project(x => x.CourseId)
                .ToListAsync();

            var profile = await _db.Profiles
                .Find(x => x.UserId == userId)
                .FirstOrDefaultAsync();

            var interests = profile?.Interests ?? "";

            var request = new AiRecommendRequest
            {
                Courses = courses.Select(c => new AiCourseDto
                {
                    Id = c.Id.ToString(),
                    Title = c.Title,
                    Description = c.Description
                }).ToList(),

                CompletedCourseIds = completedCourseIds,
                EnrolledCourseIds = enrolledCourseIds,
                Interests = interests
            };

            var response = await _http.PostAsJsonAsync(
                "http://localhost:8001/recommend",
                request
            );

            if (!response.IsSuccessStatusCode)
                return Ok(new List<object>());

            var aiResult = await response.Content
                .ReadFromJsonAsync<Dictionary<string, List<AiRecommendationResult>>>();

            var recommendations = aiResult["recommendations"];

            var result = recommendations
                .Select(r =>
                {
                    var course = courses.FirstOrDefault(c => c.Id.ToString() == r.Id);

                    if (course == null) return null;

                    return new
                    {
                        id = course.Id.ToString(),
                        title = course.Title,
                        description = course.Description,
                        score = r.Score
                    };
                })
                .Where(x => x != null)
                .ToList();

            return Ok(result);
        }
    }
}
