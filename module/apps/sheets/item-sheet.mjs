const { api, sheets } = foundry.applications;

export default class SystemItemSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["item", "foundry-system-template"],
    form: {
      submitOnChange: true,
    },
    window: {
      resizable: true,
    },
  };

  /** @inheritdoc */
  static TABS = {};

  /** @inheritdoc */
  static PARTS = {};

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    return context;
  }

  /* -------------------------------------------- */
  /*  Public API                                  */
  /* -------------------------------------------- */

  /* -------------------------------------------- */
  /*  Action Event Handlers                       */
  /* -------------------------------------------- */

  /* -------------------------------------------- */
  /*  Drag and Drop                               */
  /* -------------------------------------------- */

  /* -------------------------------------------- */
  /*  Compatibility and Deprecations              */
  /* -------------------------------------------- */

}
