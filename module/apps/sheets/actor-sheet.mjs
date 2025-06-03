import { systemId, systemPath } from "../../constants.mjs";

/** @import { ApplicationRenderOptions } from "@client/applications/_types.mjs" */

const { api, sheets } = foundry.applications;

export default class SystemActorSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["actor", "foundry-system-template"],
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
          id: "stats",
        },
        {
          id: "items",
        },
        {
          id: "effects",
        },
        {
          id: "biography",
        },
      ],
      initial: "stats",
      labelPrefix: "FoundrySystemTemplate.Sheets.Tabs",
    },
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static PARTS = {
    header: {
      template: systemPath("templates/actor/header.hbs"),
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    stats: {
      template: systemPath("templates/actor/stats.hbs"),
      scrollable: [""],
    },
    items: {
      template: systemPath("templates/actor/items.hbs"),
      scrollable: [""],
    },
    effects: {
      template: systemPath("templates/actor/effects.hbs"),
      scrollable: [""],
    },
    biography: {
      template: systemPath("templates/actor/biography.hbs"),
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
      system: this.actor.system,
      systemFields: this.actor.system.schema.fields,
      config: CONFIG,
    });

    return context;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _preparePartContext(partId, context, options) {
    context = super._preparePartContext(partId, context, options);

    switch (partId) {
      case "stats":
        await this._prepareStatsTab(context);
        break;
      case "items":
        await this._prepareItemsTab(context);
        break;
      case "effects":
        await this._prepareEffectsTab(context);
        break;
      case "biography":
        await this._prepareBiographyTab(context);
        break;
      default:
        // Systems can not only use hooks, but call them
        // This means that if the part is unrecognized (AKA added by a module)
        // That module can use `Hooks.on` to provide a callback here.
        // Unlike our functions however, they will be limited to sync-speed context prep only
        Hooks.callAll(`${systemId}.prepareActorTab`, partId, context, options);
    }

    return context;
  }

  /* -------------------------------------------------- */

  /**
   * Mutate the context for the stats tab
   * @param {object} context
   * @param {ApplicationRenderOptions} options
   */
  async _prepareStatsTab(context, options) {}

  /* -------------------------------------------------- */

  /**
   * Mutate the context for the items tab
   * @param {object} context
   * @param {ApplicationRenderOptions} options
   */
  async _prepareItemsTab(context, options) {
    // The actor's items collection is not automatically sorted, but must be sorted after access
    // All items have a `sort` property that is meant to be used for this purpose
    context.items = this.actor.items.contents.sort((a, b) => a.sort - b.sort);
  }

  /* -------------------------------------------------- */

  /**
   * Mutate the context for the effects tab
   * @param {object} context
   * @param {ApplicationRenderOptions} options
   */
  async _prepareEffectsTab(context, options) {}

  /* -------------------------------------------------- */

  /**
   * Mutate the context for the biography tab
   * @param {object} context
   * @param {ApplicationRenderOptions} options
   */
  async _prepareBiographyTab(context, options) {}

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
