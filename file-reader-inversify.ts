import { injectable, inject, Container, named } from "inversify";
import "reflect-metadata";
import { readFile } from "node:fs/promises";
import path from "node:path";

interface IParser {
  parse(data: string): string;
}

interface IFileReader {
  read(filepath: string): Promise<string>;
  parse(): string;
}

const TYPES = {
  IParser: Symbol.for("IParser"),
  IFileReader: Symbol.for("IFileReader"),
};

const TAGS = {
  JsonParser: "JsonParser",
  FileParser: "FileParser",
};

@injectable()
class JsonParser implements IParser {
  parse(data: string) {
    return JSON.parse(data);
  }
}

@injectable()
class FileParser implements IParser {
  parse(data: string) {
    return data;
  }
}

@injectable()
class FileReader implements IFileReader {
  private parser: IParser;
  private contents?: string;

  constructor(@inject(TYPES.IParser) @named(TAGS.FileParser) parser: IParser) {
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

const container = new Container();
container
  .bind<IParser>(TYPES.IParser)
  .to(JsonParser)
  .whenTargetNamed(TAGS.JsonParser);
container
  .bind<IParser>(TYPES.IParser)
  .to(FileParser)
  .whenTargetNamed(TAGS.FileParser);
container.bind<IFileReader>(TYPES.IFileReader).to(FileReader);

async function main() {
  const jsonFileReader = container.getNamed<IFileReader>(
    TYPES.IFileReader,
    TAGS.JsonParser
  );
  const fileReader = container.getNamed<IFileReader>(
    TYPES.IFileReader,
    TAGS.FileParser
  );

  await jsonFileReader.read(path.resolve(process.cwd(), "./data/example.json"));
  await fileReader.read(path.resolve(process.cwd(), "./data/example.txt"));

  console.log(jsonFileReader.parse());
  console.log(fileReader.parse());
}

main();
