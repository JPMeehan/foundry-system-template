export const systemId = "foundry-system-template";

/**
 * Translates repository paths to Foundry Data paths
 * @param {string} path - A path relative to the root of this repository
 * @returns {string} The path relative to the Foundry data folder
 */
export const systemPath = (path) => `systems/${systemID}/${path}`;

export const equipmentCategories = {
  weapon: {
    label: "FoundrySystemTemplate.Item.Equipment.Categories.weapon",
  },
  armor: {
    label: "FoundrySystemTemplate.Item.Equipment.Categories.armor",
  },
};
