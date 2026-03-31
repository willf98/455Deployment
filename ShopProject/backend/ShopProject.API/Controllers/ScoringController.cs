using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace ShopProject.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ScoringController : ControllerBase
    {
        [HttpPost("Run")]
        public async Task<IActionResult> Run()
        {
            try
            {
                // Search multiple candidate roots so the script is found whether
                // the app is launched via "dotnet run" (CWD = project dir) or
                // via Visual Studio (CWD = bin/Debug/net10.0/).
                var candidateBases = new[]
                {
                    // From bin/Debug/net10.0/ → up 5 levels = ShopProject/
                    Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..")),
                    // From project dir via dotnet run → up 2 levels = ShopProject/
                    Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..")),
                    // From project dir one level up
                    Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..")),
                };

                string? scriptPath = null;
                foreach (var root in candidateBases)
                {
                    var candidate = Path.Combine(root, "jobs", "run_inference.py");
                    if (System.IO.File.Exists(candidate))
                    {
                        scriptPath = candidate;
                        break;
                    }
                }

                if (scriptPath == null)
                {
                    return Ok(new
                    {
                        success = false,
                        message = "Inference script not found. Make sure jobs/run_inference.py exists at the project root.",
                        timestamp = DateTime.UtcNow.ToString("o")
                    });
                }

                // Try "python" first, fall back to "python3"
                foreach (var pythonExe in new[] { "python", "python3" })
                {
                    try
                    {
                        var psi = new ProcessStartInfo
                        {
                            FileName = pythonExe,
                            // IMPORTANT: quote the path so spaces in folder/username don't split the argument
                            Arguments = $"\"{scriptPath}\"",
                            WorkingDirectory = Path.GetDirectoryName(scriptPath)!,
                            RedirectStandardOutput = true,
                            RedirectStandardError = true,
                            UseShellExecute = false,
                            CreateNoWindow = true
                        };

                        using var process = new Process { StartInfo = psi };
                        process.Start();

                        // Read stdout and stderr BEFORE WaitForExit to avoid deadlock
                        // when the process produces a lot of output
                        var stdoutTask = process.StandardOutput.ReadToEndAsync();
                        var stderrTask = process.StandardError.ReadToEndAsync();

                        bool finished = process.WaitForExit(30000);

                        var stdout = await stdoutTask;
                        var stderr = await stderrTask;

                        if (!finished)
                        {
                            process.Kill();
                            return Ok(new
                            {
                                success = false,
                                message = "Scoring script timed out after 30 seconds.",
                                timestamp = DateTime.UtcNow.ToString("o")
                            });
                        }

                        bool succeeded = process.ExitCode == 0;
                        return Ok(new
                        {
                            success = succeeded,
                            message = succeeded
                                ? (string.IsNullOrWhiteSpace(stdout) ? "Scoring completed." : stdout.Trim())
                                : $"Script error (exit code {process.ExitCode}): {stderr.Trim()}",
                            timestamp = DateTime.UtcNow.ToString("o")
                        });
                    }
                    catch (System.ComponentModel.Win32Exception)
                    {
                        // This python executable wasn't found — try the next one
                        continue;
                    }
                }

                return Ok(new
                {
                    success = false,
                    message = "Python not found. Make sure Python is installed and on your PATH.",
                    timestamp = DateTime.UtcNow.ToString("o")
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    success = false,
                    message = $"Unexpected error: {ex.Message}",
                    timestamp = DateTime.UtcNow.ToString("o")
                });
            }
        }
    }
}
