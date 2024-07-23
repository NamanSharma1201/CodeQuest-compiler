import path from "path";
import { v4 as uuid } from "uuid";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import { exec } from "child_process";
import psTree from "ps-tree";
import { promisify } from "util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);
const psTreeAsync = promisify(psTree);

const CONFIG = {
  TIMEOUT: 5000,
  PATHS: {
    INPUTS: path.join(__dirname, "../Remote/Inputs"),
    CODES: path.join(__dirname, "../Remote/Codes"),
    EXECUTABLES: path.join(__dirname, "../Remote/Executables"),
  },
};

export const executeCodeRemote = async (req, res) => {
  const { language, code, input } = req.body;
  if (!code || !language) {
    return res.json({ output: "Invalid Request" });
  }

  const inputPath = path.join(CONFIG.PATHS.INPUTS, language);
  const codePath = path.join(CONFIG.PATHS.CODES, language);
  const executablePath = path.join(CONFIG.PATHS.EXECUTABLES, language);
  const id = uuid();

  const inputFile = path.join(inputPath, `${id}.txt`);
  const codeFile = path.join(codePath, `${id}.${language}`);
  const executableFile = path.join(executablePath, `${id}.out`);
  let javaFileName;

  try {
    await fs.writeFile(inputFile, input);

    if (language === "java") {
      const match = code.match(/class\s+(\w+)/);
      if (!match) {
        throw new Error("Unable to extract Java class name");
      }
      const className = match[1];
      javaFileName = `${className}.java`;
      await fs.writeFile(path.join(codePath, javaFileName), code);
    } else {
      await fs.writeFile(codeFile, code);
    }

    // console.log(language);
    let childProcess;
    const runCode = new Promise(async (resolve, reject) => {
      const options = { maxBuffer: 1024 * 1024 * 10 }; // 10MB buffer
      try {
        let command;
        if (language === "cpp") {
          command = `g++ ${codeFile} -o ${executableFile} && chmod +x ${executableFile} && ${executableFile} < ${inputFile}`;
        } else if (language === "java") {
          const className = code.match(/class\s+(\w+)/)[1];
          command = `javac ${path.join(
            codePath,
            javaFileName
          )} && cd ${codePath} && java ${className} < ${inputFile}`;
        } else if (language === "py") {
          command = `python ${codeFile} < ${inputFile}`;
        } else {
          command = `node ${codeFile} < ${inputFile}`;
        }

        // console.log(`Executing command: ${command}`); // Debug statement
        const { stdout, stderr } = await execAsync(command, options);
        if (stderr) {
          reject({ output: stderr });
        } else {
          resolve({ output: stdout });
        }
      } catch (error) {
        reject({ output: error.message, stderr: error.stderr });
      }
    });

    const timeout = new Promise((_, reject) => {
      setTimeout(async () => {
        if (childProcess) {
          await killAllChildProcesses(childProcess.pid);
        }
        reject({ output: "Time Limit Exceeded" });
      }, CONFIG.TIMEOUT);
    });

    try {
      const result = await Promise.race([timeout, runCode]);
      res.json(result);
    } catch (err) {
      res.json(err);
    }
  } catch (err) {
    res.json({ output: err.message || "Internal Error" });
  } finally {
    try {
      const filesToDelete = [codeFile, inputFile, executableFile];
      if (language === "java" && javaFileName) {
        filesToDelete.push(path.join(codePath, javaFileName));
        filesToDelete.push(
          path.join(codePath, javaFileName.replace(".java", ".class"))
        );
      }
      await Promise.all(
        filesToDelete.map((file) => fs.unlink(file).catch(() => {}))
      );
    } catch (deleteErr) {
      // console.error("Error deleting files:", deleteErr);
    }
  }
};

async function killAllChildProcesses(pid) {
  try {
    const children = await psTreeAsync(pid);
    children.forEach((child) => {
      try {
        process.kill(child.PID);
      } catch (e) {
        // console.error(`Failed to kill process ${child.PID}:`, e);
      }
    });
    process.kill(pid);
  } catch (err) {
    // console.error(`Error killing processes:`, err);
  }
}

export const submitCodeRemote = async (req, res) => {
  const { language, code, inputs, outputs } = req.body;
  if (
    !language ||
    !code ||
    !Array.isArray(inputs) ||
    !Array.isArray(outputs) ||
    inputs.length !== outputs.length
  ) {
    return res.json({ output: "Invalid Request" });
  }

  try {
    for (let i = 0; i < inputs.length; i++) {
      const result = await new Promise((resolve, reject) => {
        const dummyReq = {
          body: { language, code, input: inputs[i] },
        };

        const dummyRes = {
          json: function (result) {
            this.result = result;
            resolve(result);
          },
        };

        executeCodeRemote(dummyReq, dummyRes).catch(reject);
      });

      if (result.output === "Time Limit Exceeded") {
        return res.json({
          output: `Time Limit Exceeded at TestCase ${i + 1}`,
        });
      }

      if (result.output.trim() !== outputs[i].trim()) {
        return res.json({ output: `WRONG ANSWER at TestCase ${i + 1}` });
      }
    }

    res.json({ output: "ACCEPTED" });
  } catch (error) {
    // console.error("Error submitting code:", error);
    res.json({ output: "Internal Server Error", error: error.message });
  }
};
