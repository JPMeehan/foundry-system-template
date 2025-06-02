/**
 * A shared implementation for the system data model for items
 */
export default class BaseItemModel extends foundry.abstract.TypeDataModel {
  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [];

  /** @inheritdoc */
  static defineSchema() {
    // Schemas are made up of fields, which foundry provides in foundry.data.fields
    // This allows easier access to the fields within our schema definition
    const fields = foundry.data.fields;

    // defineSchema returns an object which gets turned into the `schema` property of the data model.
    return {
      // A set of strings is more reusable and extensible than listing a bunch of booleans in your schema
      properties: new fields.SetField(new fields.StringField({ required: true, blank: false })),
    };
  }

  /**
   * Perform item subtype specific modifications to the actor roll data
   * @param {object} rollData   Pointer to the roll data object
   */
  modifyRollData(rollData) {}
}
