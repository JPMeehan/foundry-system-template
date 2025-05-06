/**
 * A shared implementation for the system data model for items
 */
export default class BaseItemModel extends foundry.abstract.TypeDataModel {
  /**
   * Perform item subtype specific modifications to the actor roll data
   * @param {object} rollData   Pointer to the roll data object
   */
  modifyRollData(rollData) {}
}
