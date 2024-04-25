import { readFile } from "node:fs/promises";
import path from "node:path";

interface IParser {
  parse(data: string): string;
}

class JsonParser implements IParser {
  parse(data: string) {
    return JSON.parse(data);
  }
}

class FileParser implements IParser {
  parse(data: string) {
    return data;
  }
}

interface IFileReader {
  read(filepath: string): Promise<string>;
  parse(data: string): string;
}

class FileReader implements IFileReader {
  private parser: IParser;
  private contents?: string;

  constructor(parser: IParser) {
    this.parser = parser;
  }

  async read(filepath: string) {
    this.contents = await readFile(filepath, "utf-8");
    return this.contents;
  }

  parse() {
    if (!this.contents) throw new Error("No contents to parse");

    return this.parser.parse(this.contents);
  }
}

async function main() {
  const jsonParser = new JsonParser();
  const jsonFileReader = new FileReader(jsonParser);

  const fileParser = new FileParser();
  const fileReader = new FileReader(fileParser);

  await jsonFileReader.read(path.resolve(process.cwd(), "./data/example.json"));
  await fileReader.read(path.resolve(process.cwd(), "./data/example.txt"));

  console.log(jsonFileReader.parse());
  console.log(fileReader.parse());
}

main();
