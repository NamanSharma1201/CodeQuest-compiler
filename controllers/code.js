import path from "path";
import { v4 as uuid } from "uuid";
import { fileURLToPath } from "url";
import fs from "fs";
import { exec } from "child_process";
import psTree from "ps-tree";

export const executeCode = async function (req, res) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const { code, input } = req.body;

  if (!code) {
    return res.render("home", { output: "Error: Code required", code, input });
  }

  const inputPath = path.join(__dirname, "../Inputs");
  const codePath = path.join(__dirname, "../Codes");
  const outputPath = path.join(__dirname, "../Outputs");

  const id = uuid();
  const fileName = path.join(codePath, `${id}.cpp`);
  const inputfile = path.join(inputPath, `${id}.txt`);
  const outputfile = path.join(outputPath, `${id}`);

  try {
    fs.writeFileSync(fileName, code);
    fs.writeFileSync(inputfile, input);

    let childProcess;
    const compileCode = new Promise((resolve, reject) => {
      const command = `g++ ${fileName} -o ${outputfile} && chmod +x ${outputfile} && ${outputfile} < ${inputfile}`;
      // console.log("Executing command:", command);
      const options = { maxBuffer: 1024 * 1024 * 10 }; // 10MB buffer
      childProcess = exec(command, options, (error, stdout, stderr) => {
        if (error) {
          // console.error("Compilation error:", error);
          reject({ error, stderr });
        } else if (stderr) {
          // console.error("Compilation stderr:", stderr);
          reject(stderr);
        } else {
          // console.log("Compilation stdout:", stdout);
          resolve(stdout);
        }
      });
    });

    const timeout = new Promise((_, reject) => {
      setTimeout(async () => {
        if (childProcess) {
          await killAllChildProcesses(childProcess.pid);
        }
        reject(new Error("Time Limit Exceeded"));
      }, 5000);
    });

    const output = await Promise.race([timeout, compileCode]);

    res.render("home", { output, code, input });
  } catch (err) {
    res.render("home", {
      output: `${err.stderr ? err.stderr : err}`,
      code,
      input,
    });
  } finally {
    try {
      const filesToDelete = [fileName, inputfile, `${outputfile}.out`];
      filesToDelete.forEach((file) => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });
    } catch (deleteErr) {
      // console.error("Error deleting files:", deleteErr);
    }
  }
};

async function killAllChildProcesses(pid) {
  return new Promise((resolve, reject) => {
    psTree(pid, (err, children) => {
      if (err) {
        // console.error("Error finding child processes:", err);
        return reject(err);
      }
      [pid, ...children.map((p) => p.PID)].forEach((tpid) => {
        try {
          process.kill(tpid);
        } catch (e) {
          // console.error(`Error killing process ${tpid}:`, e);
        }
      });
      resolve();
    });
  });
}
