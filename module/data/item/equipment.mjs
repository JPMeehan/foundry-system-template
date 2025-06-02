import BaseItemModel from "./base.mjs";
import * as constants from "../../constants.mjs";

export default class EquipmentData extends BaseItemModel {
  /** @inheritdoc */
  static defineSchema() {
    // Calling super allows us to build on top of the schema definition in BaseActorModel
    const schema = super.defineSchema();

    // Schemas are made up of fields, which foundry provides in foundry.data.fields
    // This allows easier access to the fields within our schema definition
    const fields = foundry.data.fields;

    // If you have a constant set of choices, then you can pass them to a NumberField or StringField for validation
    schema.category = new fields.StringField({ choices: constants.equipmentCategories });

    return schema;
  }
}
