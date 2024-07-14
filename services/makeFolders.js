import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const makeFolders = () => {
  const inputPath = path.join(__dirname, "../Inputs");
  const codePath = path.join(__dirname, "../Codes");
  const outputPath = path.join(__dirname, "../Outputs");
  const remote = path.join(__dirname, "../Remote");

  const remoteCodePath = path.join(__dirname, "../Remote/Codes");

  const remoteCodePathcpp = path.join(__dirname, "../Remote/Codes/cpp");
  const remoteCodePathjava = path.join(__dirname, "../Remote/Codes/java");
  const remoteCodePathpy = path.join(__dirname, "../Remote/Codes/py");
  const remoteCodePathjs = path.join(__dirname, "../Remote/Codes/js");

  const remoteInputPath = path.join(__dirname, "../Remote/Inputs");
  const remoteInputPathcpp = path.join(__dirname, "../Remote/Inputs/cpp");
  const remoteInputPathjava = path.join(__dirname, "../Remote/Inputs/java");
  const remoteInputPathpy = path.join(__dirname, "../Remote/Inputs/py");
  const remoteInputPathjs = path.join(__dirname, "../Remote/Inputs/js");

  const remoteExecutablesPath = path.join(__dirname, "../Remote/Executables");
  const remoteExecutablesPathcpp = path.join(
    __dirname,
    "../Remote/Executables/cpp"
  );
  const remoteExecutablesPathjava = path.join(
    __dirname,
    "../Remote/Executables/java"
  );
  const remoteOutputPath = path.join(__dirname, "../Remote/Outputs");
  const remoteOutputPathcpp = path.join(__dirname, "../Remote/Outputs/cpp");
  const remoteOutputPathjava = path.join(__dirname, "../Remote/Outputs/java");
  const remoteOutputPathpy = path.join(__dirname, "../Remote/Outputs/py");
  const remoteOutputPathjs = path.join(__dirname, "../Remote/Outputs/js");

  if (!fs.existsSync(remote)) {
    fs.mkdirSync(remote, { recursive: true });
  }
  if (!fs.existsSync(remoteCodePath)) {
    fs.mkdirSync(remoteCodePath, { recursive: true });
  }
  if (!fs.existsSync(remoteInputPath)) {
    fs.mkdirSync(remoteInputPath, { recursive: true });
  }
  if (!fs.existsSync(remoteExecutablesPath)) {
    fs.mkdirSync(remoteExecutablesPath, { recursive: true });
  }
  if (!fs.existsSync(remoteOutputPath)) {
    fs.mkdirSync(remoteOutputPath, { recursive: true });
  }
  if (!fs.existsSync(inputPath)) {
    fs.mkdirSync(inputPath, { recursive: true });
  }

  if (!fs.existsSync(codePath)) {
    fs.mkdirSync(codePath, { recursive: true });
  }

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  if (!fs.existsSync(remoteCodePathcpp)) {
    fs.mkdirSync(remoteCodePathcpp, { recursive: true });
  }
  if (!fs.existsSync(remoteCodePathjava)) {
    fs.mkdirSync(remoteCodePathjava, { recursive: true });
  }
  if (!fs.existsSync(remoteCodePathpy)) {
    fs.mkdirSync(remoteCodePathpy, { recursive: true });
  }
  if (!fs.existsSync(remoteCodePathjs)) {
    fs.mkdirSync(remoteCodePathjs, { recursive: true });
  }
  if (!fs.existsSync(remoteInputPathcpp)) {
    fs.mkdirSync(remoteInputPathcpp, { recursive: true });
  }
  if (!fs.existsSync(remoteInputPathjava)) {
    fs.mkdirSync(remoteInputPathjava, { recursive: true });
  }
  if (!fs.existsSync(remoteInputPathpy)) {
    fs.mkdirSync(remoteInputPathpy, { recursive: true });
  }
  if (!fs.existsSync(remoteInputPathjs)) {
    fs.mkdirSync(remoteInputPathjs, { recursive: true });
  }
  if (!fs.existsSync(remoteOutputPathcpp)) {
    fs.mkdirSync(remoteOutputPathcpp, { recursive: true });
  }
  if (!fs.existsSync(remoteOutputPathjava)) {
    fs.mkdirSync(remoteOutputPathjava, { recursive: true });
  }
  if (!fs.existsSync(remoteOutputPathpy)) {
    fs.mkdirSync(remoteOutputPathpy, { recursive: true });
  }
  if (!fs.existsSync(remoteOutputPathjs)) {
    fs.mkdirSync(remoteOutputPathjs, { recursive: true });
  }
  if (!fs.existsSync(remoteExecutablesPathcpp)) {
    fs.mkdirSync(remoteExecutablesPathcpp, { recursive: true });
  }
  if (!fs.existsSync(remoteExecutablesPathjava)) {
    fs.mkdirSync(remoteExecutablesPathjava, { recursive: true });
  }
};

export default makeFolders;
