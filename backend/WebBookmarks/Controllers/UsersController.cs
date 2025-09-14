using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using WebBookmarks.Data;
using WebBookmarks.DTO;
using WebBookmarks.Models;

namespace WebBookmarks.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UsersController(BookmarksDBContext dbcontext) : ControllerBase
    {
        [HttpGet("{id}")]
        public async Task<ActionResult<UserInfoDTO>> GetById(Guid id)
        {
            User? user = await dbcontext.Users.FindAsync(id);
            if (user is null) { return NotFound(); }
            UserInfoDTO userInfoDTO = new(){ UserId = user.Id, Username = user.Username};
            return Ok(userInfoDTO);
        }

        [HttpPost]
        public async Task<IActionResult> Register(NewUserDTO userDTO)
        {
            User? existingUser = await dbcontext.Users.FirstOrDefaultAsync(u => u.Username == userDTO.Username);   
            if(existingUser is not null) { return Conflict("User with username already exists, choose a different username"); }

            PasswordHasher<User> passwordHasher = new();
            string hashedPassword = passwordHasher.HashPassword(null, userDTO.Password);

            User user = new User { Username = userDTO.Username, Password = hashedPassword };
            await dbcontext.Users.AddAsync(user);
            await dbcontext.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("login")]
        public async Task<ActionResult<TokensDTO>> Login(NewUserDTO userDTO)
        {
            User? user = await dbcontext.Users.FirstOrDefaultAsync(u => u.Username == userDTO.Username);
            if (user is null) {
                return Unauthorized("Incorrect Username or Password");
            }

            PasswordHasher<User> passwordHasher = new();
            PasswordVerificationResult authenticated = passwordHasher.VerifyHashedPassword(null, user.Password, userDTO.Password);

            if (authenticated != PasswordVerificationResult.Success)
            {
                return Unauthorized("Incorrect Username or Password");
            }

            List<Claim> claims = new()
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
            }; ;
            string accessToken = GetAccessToken(user);
            string refreshToken = GetRefreshToken();

            user.AccessToken = accessToken;
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryDate = DateTime.UtcNow.AddDays(7);

            await dbcontext.SaveChangesAsync();
            TokensDTO tokensDTO = new TokensDTO { AccessToken = accessToken, RefreshToken = refreshToken};
            
            return Ok(tokensDTO);
        }

        [HttpPost("refresh-token")]
       
        public async Task<ActionResult<TokensDTO>> RefreshToken(RefreshTokenDTO tokenDTO)
        {
            User? user = await dbcontext.Users.FirstOrDefaultAsync(u => u.RefreshToken == tokenDTO.RefreshToken);
            Console.WriteLine($"User is null? {user is null}, User: {user}");
            Console.WriteLine($"Is Refresh token empty? {String.IsNullOrEmpty(tokenDTO.RefreshToken)}, token: {tokenDTO.RefreshToken}");
            if(user is null || String.IsNullOrEmpty(tokenDTO.RefreshToken))
            {
                return BadRequest("Malformed Request");
            }
            if(user.RefreshTokenExpiryDate < DateTime.UtcNow)
            {
                return Unauthorized("Expired Refresh Token");
            }
            string accessToken = GetAccessToken(user);
            string refreshToken = GetRefreshToken();

            user.AccessToken = accessToken;
            user.RefreshTokenExpiryDate = DateTime.UtcNow.AddDays(7);
            user.RefreshToken = refreshToken;

            await dbcontext.SaveChangesAsync();
            TokensDTO tokensDTO = new TokensDTO
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
            };
            return Ok(tokensDTO);
        }


        [HttpPatch("{id}")]
        [Authorize]
        public async Task<ActionResult<UserInfoDTO>> Patch(Guid id, [FromBody] UserPatchDTO userDTO)
        {
            Guid loggedIdUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User? user = await dbcontext.Users.FindAsync(id);
            if(user is null) { return NotFound(); }
            if(user.Id != loggedIdUserId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot modify this content"); }

            User? checkUser = await dbcontext.Users.FirstOrDefaultAsync(u => u.Username == userDTO.Username);
            if (checkUser is not null)
            {
                return Conflict("Another user already has this username");
            }
            user.Username = userDTO.Username;
            await dbcontext.SaveChangesAsync();
            UserInfoDTO userInfo = new()
            {
                Username = user.Username,
                UserId = user.Id
            };
            return Ok(userInfo);
        }

        [HttpDelete("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            Guid loggedInUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            if(loggedInUserId != id)
            {
                return Forbid("You cannot execute this action");
            }
            User? user = await dbcontext.Users.Include(u => u.OwnedTeams)
                   .Include(u => u.Teams)
                   .Include(u => u.Bookmarks)// member of other teams
                   .FirstOrDefaultAsync(u => u.Id == id);
            if(user is null) { return NotFound(); }
            dbcontext.Teams.RemoveRange(user.OwnedTeams);

            List<Folder> folders = await dbcontext.Folders.Where(f => f.OwnerID == id).ToListAsync();
            dbcontext.Folders.RemoveRange(folders);
            dbcontext.Bookmarks.RemoveRange(user.Bookmarks);
            foreach(Team team in user.Teams.ToList())
            {
                team.Members.Remove(user);
            }
            dbcontext.Users.Remove(user);
            await dbcontext.SaveChangesAsync();

            return NoContent();
        }


        [NonAction]
        public string GetRefreshToken()
        {
            byte[] randomNumber = new byte[32]; // byte 32 characters

            using RandomNumberGenerator rg = RandomNumberGenerator.Create();
            rg.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        [NonAction]
        public string GetAccessToken(User user)
        {
            List<Claim> claims = new List<Claim>(){
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username)
            };
            SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("SIGNING_KEY")));
            SigningCredentials credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);
            // Use a hashing algorithm.
            JwtSecurityToken tokenDescriptor = new JwtSecurityToken(
                issuer: Environment.GetEnvironmentVariable("ISSUER"),
                audience: Environment.GetEnvironmentVariable("CLIENT_URL"),
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }

    }
}
