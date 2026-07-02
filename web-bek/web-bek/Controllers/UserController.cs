using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using web_bek.Dto;
using web_bek.Models;
using web_bek.Services;

namespace web_bek.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]

    public class UsersController : ControllerBase
    {
        private readonly MongoDbService _mongo;

        public UsersController(MongoDbService mongo)
        {
            _mongo = mongo;
        }

        // vrati usere sve 
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _mongo.Users.Find(x => x.Role == "User" || x.Role=="Lecturer").ToListAsync();

            return Ok(users);
        }

        // enable disable korisnika 
        [HttpPut("toggle/{id}")]
        public async Task<IActionResult> ToggleUser(string id)
        {
            var user = await _mongo.Users
                .Find(x => x.Id == id)
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found" });

            var update = Builders<User>.Update
                .Set(x => x.IsActive, !user.IsActive);

            await _mongo.Users.UpdateOneAsync(
                x => x.Id == id,
                update
            );

            return Ok(new { message = "User updated" });
        }
        [HttpPut("change-role")]
        public async Task<IActionResult> ChangeUserRole(ChangeUserRoleDto dto)
        {
            if (dto.Role != "User" && dto.Role != "Lecturer")
                return BadRequest(new { message = "Invalid role" });

            var user = await _mongo.Users
                .Find(x => x.Id == dto.UserId)
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found" });

            if (user.Role == "Admin")
                return BadRequest(new { message = "Cannot change admin role" });

            await _mongo.Users.UpdateOneAsync(
                x => x.Id == dto.UserId,
                Builders<User>.Update.Set(x => x.Role, dto.Role)
            );

            return Ok(new { message = "Role updated" });
        }
    }
}