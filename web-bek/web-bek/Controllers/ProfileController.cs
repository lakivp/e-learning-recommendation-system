using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using web_bek.Dto;
using web_bek.Models;
using web_bek.Services;

namespace web_bek.Controllers
{
    [ApiController]
    [Route("api/profile")]
    [Authorize]

    public class ProfileController : ControllerBase
    {
        private readonly MongoDbService _mongo;

        public ProfileController(MongoDbService mongo)
        {
            _mongo = mongo;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetProfile(string userId)
        {
            var user = await _mongo.Users
                .Find(x => x.Id == userId)
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound();

            var profile = await _mongo.Profiles
                .Find(x => x.UserId == userId)
                .FirstOrDefaultAsync();

            return Ok(new
            {
                user.Id,
                user.Name,
                user.Surname,
                user.Username,
                user.Email,
                user.Role,
                Bio = profile?.Bio ?? "",
                Phone = profile?.Phone ?? "",
                Interests = profile?.Interests ?? ""
            });
        }

        [HttpPut("update/{userId}")]
        public async Task<IActionResult> UpdateProfile(string userId, UpdateProfileDto dto)
        {
            var existingUser = await _mongo.Users
                .Find(x => x.Username == dto.Username && x.Id != userId)
                .FirstOrDefaultAsync();

            if (existingUser != null)
                return BadRequest(new { message = "Username already exists" });

            var existingEmail = await _mongo.Users
                .Find(x => x.Email == dto.Email && x.Id != userId)
                .FirstOrDefaultAsync();

            if (existingEmail != null)
                return BadRequest(new { message = "Email already exists" });


            var update = Builders<User>.Update
                .Set(x => x.Name, dto.Name)
                .Set(x => x.Surname, dto.Surname)
                .Set(x => x.Username, dto.Username)
                .Set(x => x.Email, dto.Email);

            await _mongo.Users.UpdateOneAsync(x => x.Id == userId, update);

            var profile = await _mongo.Profiles
                .Find(x => x.UserId == userId)
                .FirstOrDefaultAsync();

            if (profile == null)
            {
                var newProfile = new Profile
                {
                    UserId = userId,
                    Bio = dto.Bio,
                    Phone = dto.Phone,
                    Interests = dto.Interests
                };

                await _mongo.Profiles.InsertOneAsync(newProfile);
            }
            else
            {
                var pUpdate = Builders<Profile>.Update
                    .Set(x => x.Bio, dto.Bio)
                    .Set(x => x.Phone, dto.Phone)
                    .Set(x => x.Interests, dto.Interests);

                await _mongo.Profiles.UpdateOneAsync(
                    x => x.UserId == userId,
                    pUpdate
                );
            }

            return Ok(new { message = "Profile updated" });
        }
    }
}