import * as readline from "readline/promises";

/**
 * TODO: Renames various files after asking system name.
 * - kebab-case: System ID, file names
 * - camelCase: Global namespace. Offer
 * - CAPS_SNAKE: CONFIG & CONST
 *
 * Also need to adjust author info
 */

let title = "Foundry System Template";
let kebabCase = "foundry-system-template";
let camelCase = "foundrySystemTemplate";
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
let message = `System ID? Package IDs may only be alphanumeric with hyphens or underscores.\nDefault: ${titleToKebab(title)}\n`;
while (!validID) {
  kebabCase = await rl.question(message);
  kebabCase ||= titleToKebab(title);
  validID = allowedId.test(kebabCase);
}

const allowedNamespace = /^[A-Za-z0-9_]+$/;
let validNamespace = false;
message = `Global Namespace? Convention is to use camelCase.\nDefault: ${titleToCamel(title)}\n`;
while (!validNamespace) {
  camelCase = await rl.question(message);
  camelCase ||= titleToCamel(title);
  validNamespace = allowedNamespace.test(camelCase);
}

let validI18N = false;
message = `Localization Namespace? Convention is to use SNAKE_CAPS.\nDefault: ${titleToSnakeCaps(title)}\n`;
while (!validI18N) {
  i18n = await rl.question(message);
  i18n ||= titleToSnakeCaps(title);
  validI18N = allowedNamespace.test(i18n);
}

rl.close();

console.log(title, kebabCase, camelCase, i18n);
