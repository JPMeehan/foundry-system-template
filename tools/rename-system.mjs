import * as readline from "readline/promises";
import * as fs from "fs/promises";
import path from "path";

class SystemGenerator {
  /**
   *
   * @param {string} title
   * @param {string} systemId
   * @param {string} namespace
   * @param {string} i18n
   */
  constructor(title, systemId, namespace, i18n) {
    /**
     * The system's title
     * @type {string}
     */
    this.title = title;

    /**
     * The system's ID
     * @type {string}
     */
    this.systemId = systemId;

    /**
     * The system's namespace
     * @type {string}
     */
    this.systemNamespace = namespace;

    /**
     * The system's i18n path
     * @type {string}
     */
    this.i18n = i18n;
  }

  /**
   * The original strings to replace
   * @type {Record<string, string>}
   */
  get originals() {
    return {
      title: "Foundry System Template",
      kebabCase: "foundry-system-template",
      camelCase: "foundrySystemTemplate",
      i18n: "FoundrySystemTemplate",
    };
  }

  async build() {
    const systemFolder = path.join("..", this.systemId);
    for await (const file of fs.glob("**/*", { exclude: (entry) => {
      return (entry.startsWith("foundry") || entry.startsWith("node_modules") || (entry === path.join("tools", "rename-system.mjs")));
    } })) {
      const newPath = path.join(systemFolder, file);
      await fs.copyFile(file, newPath);
    }
  }
}

let title = "Foundry System Template";
let systemId = "foundry-system-template";
let systemNamespace = "foundrySystemTemplate";
let i18n = "FoundrySystemTemplate";

/**
 * Converts the title case to kebab-case
 * @param {string} input
 * @returns {string}
 */
function titleToKebab(input) {
  const stripSpecial = input.replaceAll(/[^A-Za-z0-9-_ ]/g, "");
  return stripSpecial.replaceAll(" ", "-").toLowerCase();
}

/**
 * Converts the title case to camelCase
 * @param {string} input
 * @returns {string}
 */
function titleToCamel(input) {
  const stripSpecial = input.replaceAll(/[^A-Za-z0-9-_ ]/g, "");
  const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);
  return stripSpecial.split(" ").map((v, i) => i ? capitalize(v) : v.toLowerCase()).join("");
}

/**
 * Converts the title case to SNAKE_CAPS
 * @param {string} input
 * @returns {string}
 */
function titleToSnakeCaps(input) {
  const stripSpecial = input.replaceAll(/[^A-Za-z0-9-_ ]/g, "");
  return stripSpecial.replaceAll(" ", "_").toUpperCase();
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

title = await rl.question("System Title?\n");

const allowedId = /^[A-Za-z0-9-_]+$/;
let validID = false;
let message = `System ID? Package IDs may only be alphanumeric with hyphens or underscores. This will also be the name of the folder for your system.\nDefault: ${titleToKebab(title)}\n`;
while (!validID) {
  systemId = await rl.question(message);
  systemId ||= titleToKebab(title);
  validID = allowedId.test(systemId);
}

const allowedNamespace = /^[A-Za-z0-9_]+$/;
let validNamespace = false;
message = `Global Namespace? Convention is to use camelCase.\nDefault: ${titleToCamel(title)}\n`;
while (!validNamespace) {
  systemNamespace = await rl.question(message);
  systemNamespace ||= titleToCamel(title);
  validNamespace = allowedNamespace.test(systemNamespace);
}

let validI18N = false;
message = `Localization Namespace? Convention is to use SNAKE_CAPS.\nDefault: ${titleToSnakeCaps(title)}\n`;
while (!validI18N) {
  i18n = await rl.question(message);
  i18n ||= titleToSnakeCaps(title);
  validI18N = allowedNamespace.test(i18n);
}

rl.close();

const generator = new SystemGenerator(title, systemId, systemNamespace, i18n);

generator.build();
