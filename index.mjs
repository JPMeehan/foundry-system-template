import {applications, data, documents, rolls, utils, SystemCONFIG, SystemCONST} from "./module/_module.mjs";

globalThis.foundrySystemTemplate = {CONFIG: SystemCONFIG, CONST: SystemCONST, applications, data, documents, rolls, utils};

Hooks.once("init", () => {

  // TODO: Document Registration

  // TODO: Data Model Registration

  // TODO: Sheet Registration

  CONFIG.Dice.rolls = [rolls.SystemRoll];

  utils.SystemSettingsHandler.registerSettings();
});

Hooks.once("i18nInit", () => {
  /**
   * An array of status IDs provided by core foundry to remove.
   * @type {string[]}
   */
  const toRemove = [];
  CONFIG.statusEffects = CONFIG.statusEffects.filter(effect => !toRemove.includes(effect.id));
  // Status Effect Transfer
  for (const [id, value] of Object.entries(CONFIG.conditions)) {
    CONFIG.statusEffects.push({id, ...value});
  }
});

Hooks.once("ready", () => {
  // This is a good place to print ASCII art with `console.log`

  Hooks.callAll("system.ready");
});

/**
 * Render Hooks
 */

/**
 * Other Hooks
 */
