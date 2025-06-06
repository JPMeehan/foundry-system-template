import { systemId, systemPath } from "../../constants.mjs";

const { api, sheets } = foundry.applications;

/**
 * A general implementation of ItemSheetV2 for system usage
 */
export default class SystemItemSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["item", systemId],
    form: {
      submitOnChange: true,
    },
    window: {
      resizable: true,
    },
    actions: {
      viewDoc: this.#viewEffect,
      createDoc: this.#createEffect,
      deleteDoc: this.#deleteEffect,
      toggleEffect: this.#toggleEffect,
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
      template: systemPath("templates/item/description.hbs"),
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
    context = await super._preparePartContext(partId, context, options);

    switch (partId) {
      case "header": break;
      case "tabs": break;
      case "description":
        context.tab = context.tabs[partId];
        await this._prepareDescriptionTab(context, options);
        break;
      case "details":
        context.tab = context.tabs[partId];
        await this._prepareDetailsTab(context, options);
        break;
      case "effects":
        context.tab = context.tabs[partId];
        await this._prepareEffectsTab(context, options);
        break;
      default:
        // Systems can not only use hooks, but call them
        // This means that if the part is unrecognized (AKA added by a module)
        // That module can use `Hooks.on` to provide a callback here.
        // Unlike our functions however, they will be limited to sync-speed context prep only
        context.tab = context.tabs[partId];
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
  async _prepareDescriptionTab(context, options) {

    // Text Enrichment is a foundry-specific implementation of RegEx that transforms text like [[/r 1d20]] into a clickable link
    // It's needed for the nice "display" version of the prosemirror editors
    const TextEditor = foundry.applications.ux.TextEditor.implementation;

    // One common pitfall with reusing enrichment options is that they are passed by reference to descendent functions
    // This can cause problems with foundry's Embed Depth handling, so always destructure with { ...options } when passing to a new enrichHTML call
    const enrichmentOptions = {
      secrets: this.item.isOwner,
      rollData: this.item.getRollData(),
      relativeTo: this.item,
    };

    context.enrichedDescription = await TextEditor.enrichHTML(this.item.system.description.value, { ...enrichmentOptions });

    context.enrichedGMNotes = await TextEditor.enrichHTML(this.item.system.description.gm, { ...enrichmentOptions });
  }

  /* -------------------------------------------------- */

  /**
   * Mutate the context for the details tab
   * @param {object} context
   * @param {ApplicationRenderOptions} options
   */
  async _prepareDetailsTab(context, options) {
    // This is a good place to prepare the options for selects
    context.propertyOptions = Object.entries(foundrySystemTemplate.CONFIG.itemProperties).reduce((obj, [value, property]) => {
      if (property.itemTypes.has(this.item.type)) obj.push({ value, ...property });
      return obj;
    }, []);
  }

  /* -------------------------------------------------- */

  /**
   * Mutate the context for the effects tab
   * @param {object} context
   * @param {ApplicationRenderOptions} options
   */
  async _prepareEffectsTab(context, options) {
    const categories = {
      temporary: {
        type: "temporary",
        label: game.i18n.localize("FoundrySystemTemplate.Effect.Temporary"),
        effects: [],
      },
      passive: {
        type: "passive",
        label: game.i18n.localize("FoundrySystemTemplate.Effect.Passive"),
        effects: [],
      },
      inactive: {
        type: "inactive",
        label: game.i18n.localize("FoundrySystemTemplate.Effect.Inactive"),
        effects: [],
      },
    };

    // Iterate over active effects, classifying them into categories
    for (const e of this.item.effects) {
      if (e.disabled) categories.inactive.effects.push(e);
      else if (e.isTemporary) categories.temporary.effects.push(e);
      else categories.passive.effects.push(e);
    }

    // Sort each category
    for (const c of Object.values(categories)) {
      c.effects.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    }
    context.effects = categories;
  }

  /* -------------------------------------------- */
  /*  Public API                                  */
  /* -------------------------------------------- */

  /* -------------------------------------------- */
  /*  Action Event Handlers                       */
  /* -------------------------------------------- */

  /**
   * Renders an embedded document's sheet
   *
   * @this SystemItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async #viewEffect(event, target) {
    const effect = this._getEffect(target);
    effect.sheet.render(true);
  }

  /* -------------------------------------------------- */

  /**
   * Handles item deletion
   *
   * @this SystemItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async #deleteEffect(event, target) {
    const effect = this._getEffect(target);
    effect.delete();
  }

  /* -------------------------------------------------- */

  /**
   * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
   *
   * @this SystemItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async #createEffect(event, target) {
    const aeCls = getDocumentClass("ActiveEffect");
    const effectData = {
      name: aeCls.defaultName({
        type: target.dataset.type,
        parent: this.item,
      }),
    };
    for (const [dataKey, value] of Object.entries(target.dataset)) {
      if (["action", "documentClass"].includes(dataKey)) continue;
      foundry.utils.setProperty(effectData, dataKey, value);
    }

    aeCls.create(effectData, { parent: this.item });
  }

  /* -------------------------------------------------- */

  /**
   * Determines effect parent to pass to helper
   *
   * @this SystemItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async #toggleEffect(event, target) {
    const effect = this._getEffect(target);
    effect.update({ disabled: !effect.disabled });
  }

  /* -------------------------------------------- */
  /*  Drag and Drop                               */
  /* -------------------------------------------- */

  /* -------------------------------------------------- */
  /*   Helper functions                                 */
  /* -------------------------------------------------- */

  /**
   * Fetches the row with the data for the rendered embedded document
   *
   * @param {HTMLElement} target  The element with the action
   * @returns {HTMLLIElement} The document's row
   */
  _getEffect(target) {
    const li = target.closest(".effect");
    return this.item.effects.get(li?.dataset?.effectId);
  }

}
