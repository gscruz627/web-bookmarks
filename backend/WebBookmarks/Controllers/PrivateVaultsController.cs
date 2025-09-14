using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebBookmarks.Data;
using WebBookmarks.DTO;
using WebBookmarks.Models;

namespace WebBookmarks.Controllers
{
    [Route("api/vaults")]
    [ApiController]
    public class PrivateVaultsController(BookmarksDBContext dbContext) : ControllerBase
    {
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetVault()
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User user = (await dbContext.Users.FindAsync(userId))!;
            PrivateVault? vault = await dbContext.PrivateVaults.FirstOrDefaultAsync(v => v.OwnerID == userId);
            if(vault is null)
            {
                return Ok(new { doesNotHaveVault = true });
            }
            PrivateVaultInfoDTO vaultDTO = new()
            {
                Id = vault.Id,
                KdfHash = vault.KdfHash,
                KdfIterations = vault.KdfIterations,
                KdfSalt = vault.KdfSalt,
                WrapIV = vault.WrapIV,
                WrappedDEK = vault.WrappedDEK,
            };
            return Ok(vaultDTO);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateVault(PrivateVaultDTO vaultDTO)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User user = (await dbContext.Users.FindAsync(userId))!;
            PrivateVault? vault = await dbContext.PrivateVaults.FirstOrDefaultAsync(v => v.OwnerID == userId);
            if(vault is not null) { return Conflict("Vault already exists."); }

            PrivateVault newVault = new PrivateVault()
            {
                OwnerID = userId,
                Owner = user,
                WrappedDEK = vaultDTO.WrappedDEK,
                WrapIV = vaultDTO.WrapIV,
                KdfIterations = vaultDTO.KdfIterations,
                KdfSalt = vaultDTO.KdfSalt,
                KdfHash = vaultDTO.KdfHash
            };
            user.VaultID = newVault.Id;

            await dbContext.PrivateVaults.AddAsync(newVault);
            await dbContext.SaveChangesAsync();

            PrivateVaultInfoDTO infoDTO = new()
            {
                Id = newVault.Id,
                KdfSalt = newVault.KdfSalt,
                KdfIterations = newVault.KdfIterations,
                KdfHash = newVault.KdfHash,
                WrappedDEK = newVault.WrappedDEK,
                WrapIV = newVault.WrapIV,
            };

            return Ok(infoDTO);
        }

    }
}
