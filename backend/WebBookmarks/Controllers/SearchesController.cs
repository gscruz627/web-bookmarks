using Microsoft.AspNetCore.Mvc;

namespace WebBookmarks.Controllers
{
    [Route("api/searches")]
    [ApiController]
    public class SearchesController : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            using HttpClient client = new HttpClient();
            HttpResponseMessage response = await client.GetAsync(query);
            response.EnsureSuccessStatusCode();
            string html = await response.Content.ReadAsStringAsync();
            return Content(html, "text/html");
        }
    }
}
