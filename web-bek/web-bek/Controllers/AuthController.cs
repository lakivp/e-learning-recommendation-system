namespace web_bek.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using MongoDB.Driver;
    using System.Security.Claims;
    using web_bek.Dto;
    using web_bek.Models;
    using web_bek.Services;

    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly MongoDbService _mongo;
        private readonly JwtService _jwt;
        private readonly EmailService _email;

        public AuthController(MongoDbService mongo, JwtService jwt, EmailService email)
        {
            _mongo = mongo;
            _jwt = jwt;
            _email = email;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {

            if(string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password) ||
                string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Name) || 
                string.IsNullOrWhiteSpace(dto.Surname))
            {
                return BadRequest(new { message = "All fields are requiered" });
            }
            var existing = await _mongo.Users
             .Find(x => x.Username == dto.Username)
             .FirstOrDefaultAsync();

            var existingEmail = await _mongo.Users
             .Find(x => x.Email == dto.Email)
             .FirstOrDefaultAsync();

            if (existing != null)
                return BadRequest(new { message = "Username already exists" });

            if (existingEmail != null)
                return BadRequest(new { message = "Email already exists" });

            var hashed = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var emailToken = Guid.NewGuid().ToString();

            var user = new User
            {
                Name = dto.Name,
                Surname = dto.Surname,
                Username = dto.Username,
                Email = dto.Email,
                Password = hashed,
                Role = "User",
                CreatedAt = DateTime.UtcNow,
                IsEmailConfirmed = false,
                EmailConfirmationToken = emailToken,
                WantsToBeLecturer = dto.WantsToBeLecturer,
                LecturerApproved = false
            };

            await _mongo.Users.InsertOneAsync(user);

            var link = $"http://localhost:4200/confirm-email?token={emailToken}";

            await _email.SendConfirmEmail(dto.Email, link);

            return Ok(new { message = "Check your email to confirm account" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _mongo.Users
                .Find(x => x.Username == dto.Username)
                .FirstOrDefaultAsync();

            if (user == null)
                return Unauthorized(new { message = "Wrong username" });

            if (!user.IsActive)
                return Unauthorized(new { message = "Account disabled" });

            if (!user.IsEmailConfirmed)
                return Unauthorized(new { message = "Please confirm your email before logging in" });

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
                return Unauthorized(new { message = "Wrong password" });

            var token = _jwt.GenerateToken(user);

            Response.Cookies.Append("access_token", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = false, 
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddMinutes(120)
            });

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Role
            });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            var user = await _mongo.Users
                .Find(x => x.Email == dto.Email)
                .FirstOrDefaultAsync();

            if (user == null)
                return BadRequest(new { message = "Email not found" });

            var token = Guid.NewGuid().ToString();

            var update = Builders<User>.Update
                .Set(x => x.ResetToken, token)
                .Set(x => x.ResetTokenExpiry, DateTime.UtcNow.AddMinutes(30));

            await _mongo.Users.UpdateOneAsync(
                x => x.Email == dto.Email,
                update
            );

            var link = $"http://localhost:4200/reset-password?token={token}";

            await _email.SendResetEmail(dto.Email, link);

            return Ok(new { message = "Reset link sent to email" });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
        {
            var user = await _mongo.Users
                .Find(x => x.ResetToken == dto.Token)
                .FirstOrDefaultAsync();

            if (user == null)
                return BadRequest(new { message = "Invalid token" });

            if (user.ResetTokenExpiry < DateTime.UtcNow)
                return BadRequest(new { message = "Token expired" });

            var hashed = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            var update = Builders<User>.Update
                .Set(x => x.Password, hashed)
                .Set(x => x.ResetToken, null)
                .Set(x => x.ResetTokenExpiry, null);

            await _mongo.Users.UpdateOneAsync(
                x => x.Id == user.Id,
                update
            );

            return Ok(new { message = "Password updated" });
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
                return Unauthorized();

            var user = await _mongo.Users
                .Find(x => x.Id == userId)
                .FirstOrDefaultAsync();

            if (user == null)
                return BadRequest(new { message = "User not found" });

            if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.Password))
                return BadRequest(new { message = "Old password is incorrect" });

            var hashed = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            await _mongo.Users.UpdateOneAsync(
                x => x.Id == userId,
                Builders<User>.Update.Set(x => x.Password, hashed)
            );

            return Ok(new { message = "Password updated successfully" });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("access_token");
            return Ok(new { message = "Logged out" });
        }

        [HttpGet("me")]
        public IActionResult Me()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            return Ok(new { userId, role });
        }

        [HttpPost("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailDto dto)
        {
            var user = await _mongo.Users
                .Find(x => x.EmailConfirmationToken == dto.Token)
                .FirstOrDefaultAsync();

            if (user == null)
                return BadRequest(new { message = "Invalid or expired token" });

            var update = Builders<User>.Update
                .Set(x => x.IsEmailConfirmed, true)
                .Set(x => x.EmailConfirmationToken, null);

            await _mongo.Users.UpdateOneAsync(
                x => x.Id == user.Id,
                update
            );

            return Ok(new { message = "Email confirmed successfully" });
        }

    }
}
