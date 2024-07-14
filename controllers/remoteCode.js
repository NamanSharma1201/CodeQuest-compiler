import path from "path";
import { v4 as uuid } from "uuid";
import { fileURLToPath } from "url";
import fs from "fs";
import { exec } from "child_process";
import psTree from "ps-tree";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const executeCodeRemote = async (req, res) => {
  const { language, code, input } = req.body;
  if (!code || !language) {
    return res.send({ message: "Invalid Request" });
  }

  const inputPath = path.join(__dirname, "../Remote/Inputs", language);
  const codePath = path.join(__dirname, "../Remote/Codes", language);
  const executablePath = path.join(
    __dirname,
    "../Remote/Executables",
    language
  );
  const id = uuid();

  const inputFile = path.join(inputPath, `${id}.txt`);
  const codeFile = path.join(codePath, `${id}.${language}`);
  const executableFile = path.join(executablePath, `${id}.exe`);
  let javaFileName;

  try {
    fs.writeFileSync(inputFile, input);

    if (language === "java") {
      const className = code.match(/class\s+(\w+)/)[1];
      javaFileName = `${className}.java`;
      fs.writeFileSync(path.join(codePath, javaFileName), code);
    } else {
      fs.writeFileSync(codeFile, code);
    }

    let childProcess;
    const runCode = new Promise((resolve, reject) => {
      if (language === "cpp") {
        childProcess = exec(
          `g++ ${codeFile} -o ${executableFile} && ${executableFile} < ${inputFile}`,
          (error, stdout, stderr) => {
            if (error) {
              reject({ error, stderr });
            } else if (stderr) {
              reject(stderr);
            } else {
              resolve(stdout);
            }
          }
        );
      } else if (language === "java") {
        const className = code.match(/class\s+(\w+)/)[1];
        childProcess = exec(
          `javac ${path.join(
            codePath,
            javaFileName
          )} && cd ${codePath} && java ${className} < ${inputFile}`,
          (error, stdout, stderr) => {
            if (error) {
              reject({ error, stderr });
            } else if (stderr) {
              reject(stderr);
            } else {
              resolve(stdout);
            }
          }
        );
      } else if (language === "py") {
        childProcess = exec(
          `python ${codeFile} < ${inputFile}`,
          (error, stdout, stderr) => {
            if (error) {
              reject({ error, stderr });
            } else if (stderr) {
              reject(stderr);
            } else {
              resolve(stdout);
            }
          }
        );
      } else {
        childProcess = exec(
          `node ${codeFile} < ${inputFile}`,
          (error, stdout, stderr) => {
            if (error) {
              reject({ error, stderr });
            } else if (stderr) {
              reject(stderr);
            } else {
              resolve(stdout);
            }
          }
        );
      }
    });

    const timeout = new Promise((_, reject) => {
      setTimeout(async () => {
        if (childProcess) {
          await killAllChildProcesses(childProcess.pid);
        }
        reject("Time Limit Exceeded");
      }, 5000);
    });

    const output = await Promise.race([timeout, runCode]);
    res.send(output);
  } catch (err) {
    res.send(err.stderr ? err.stderr : err);
  } finally {
    try {
      const filesToDelete = [codeFile, inputFile, executableFile];
      if (language === "java" && javaFileName) {
        filesToDelete.push(path.join(codePath, javaFileName));
        filesToDelete.push(
          path.join(codePath, javaFileName.replace(".java", ".class"))
        );
      }
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
export const submitCodeRemote = async (req, res) => {
  const { language, code, inputs, outputs } = req.body;
  if (!language || !code || !inputs || !outputs) {
    return res.send("Invalid Request");
  }

  try {
    for (let i = 0; i < inputs.length; i++) {
      const output = await new Promise((resolve, reject) => {
        const dummyReq = {
          body: { language, code, input: inputs[i] },
        };

        const dummyRes = {
          send: (result) => {
            resolve(result);
          },
        };

        executeCodeRemote(dummyReq, dummyRes).catch(reject);
      });

      // Trim whitespace and newlines from the output and the expected output

      if (output.trim() !== outputs[i].trim()) {
        return res.send(`WRONG ANSWER at TestCase ${i + 1}`);
      }
    }

    res.send("ACCEPTED");
  } catch (error) {
    console.error("Error submitting code:", error);
    res.send("Internal Server Error");
  }
};
