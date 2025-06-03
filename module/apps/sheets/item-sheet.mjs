import { systemId, systemPath } from "../../constants.mjs";

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

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static TABS = {
    primary: {
      tabs: [
        {
          id: "description",
        },
        {
          id: "details",
        },
        {
          id: "effects",
        },
      ],
      initial: "description",
      labelPrefix: "FoundrySystemTemplate.Sheets.Tabs",
    },
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static PARTS = {
    header: {
      template: systemPath("templates/item/header.hbs"),
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    description: {
      template: systemPath("templates/item/details.hbs"),
      scrollable: [""],
    },
    details: {
      template: systemPath("templates/item/details.hbs"),
      scrollable: [""],
    },
    effects: {
      template: systemPath("templates/item/effects.hbs"),
      scrollable: [""],
    },
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  _initializeApplicationOptions(options) {
    const initialized = super._initializeApplicationOptions(options);

    // Add the document type (e.g. "npc") to the classes of the sheet
    initialized.classes.push(initialized.document.type);

    return initialized;
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    Object.assign(context, {
      system: this.item.system,
      systemFields: this.item.system.schema.fields,
      config: CONFIG,
    });

    return context;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _preparePartContext(partId, context, options) {
    context = super._preparePartContext(partId, context, options);

    switch (partId) {
      case "description":
        await this._prepareDescriptionTab(context, options);
        break;
      case "details":
        await this._prepareDetailsTab(context, options);
        break;
      case "effects":
        await this._prepareEffectsTab(context, options);
        break;
      default:
        // Systems can not only use hooks, but call them
        // This means that if the part is unrecognized (AKA added by a module)
        // That module can use `Hooks.on` to provide a callback here.
        // Unlike our functions however, they will be limited to sync-speed context prep only
        Hooks.callAll(`${systemId}.prepareItemTab`, partId, context, options);
    }

    return context;
  }

  /* -------------------------------------------------- */

  /**
   * Mutate the context for the description tab
   * @param {object} context
   * @param {ApplicationRenderOptions} options
   */
  async _prepareDescriptionTab(context, options) {}

  /* -------------------------------------------------- */

  /**
   * Mutate the context for the details tab
   * @param {object} context
   * @param {ApplicationRenderOptions} options
   */
  async _prepareDetailsTab(context, options) {}

  /* -------------------------------------------------- */

  /**
   * Mutate the context for the effects tab
   * @param {object} context
   * @param {ApplicationRenderOptions} options
   */
  async _prepareEffectsTab(context, options) {}

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
