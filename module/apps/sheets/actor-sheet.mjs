import { systemId, systemPath } from "../../constants.mjs";

/** @import { ApplicationRenderOptions } from "@client/applications/_types.mjs" */

const { api, sheets } = foundry.applications;

/**
 * A general implementation of ActorSheetV2 for system usage
 */
export default class SystemActorSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["actor", systemId],
    form: {
      submitOnChange: true,
    },
    window: {
      resizable: true,
    },
    actions: {
      viewDoc: this.#viewDoc,
      createDoc: this.#createDoc,
      deleteDoc: this.#deleteDoc,
      toggleEffect: this.#toggleEffect,
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
    context = await super._preparePartContext(partId, context, options);

    switch (partId) {
      case "header": break;
      case "tabs": break;
      case "stats":
        await this._prepareStatsTab(context);
        context.tab = context.tabs[partId];
        break;
      case "items":
        await this._prepareItemsTab(context);
        context.tab = context.tabs[partId];
        break;
      case "effects":
        await this._prepareEffectsTab(context);
        context.tab = context.tabs[partId];
        break;
      case "biography":
        await this._prepareBiographyTab(context);
        context.tab = context.tabs[partId];
        break;
      default:
        // Systems can not only use hooks, but call them
        // This means that if the part is unrecognized (AKA added by a module)
        // That module can use `Hooks.on` to provide a callback here.
        // Unlike our functions however, they will be limited to sync-speed context prep only
        context.tab = context.tabs[partId];
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
  async _prepareStatsTab(context, options) {
    // This is a good spot to prepare the options for any selects
  }

  /* -------------------------------------------------- */

  /**
   * Mutate the context for the items tab
   * @param {object} context
   * @param {ApplicationRenderOptions} options
   */
  async _prepareItemsTab(context, options) {
    const groups = Object.fromEntries(game.documentTypes.Item.map((t) => {
      return [t, { label: game.i18n.localize(CONFIG.Item.typeLabels[t]), items: [] }];
    }));

    // Actor's have a getter, `itemTypes`, that groups items by their type
    // The actor's items collection is not automatically sorted, but must be sorted after access
    // All items have a `sort` property that is meant to be used for this purpose
    for (const [type, items] of Object.entries(this.actor.itemTypes)) {
      groups[type].items = items.toSorted((a, b) => a.sort - b.sort);
    }

    // The "base" type is a foundry default that systems should not actually use
    delete groups.base;

    context.itemTypes = groups;
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
    for (const e of this.actor.allApplicableEffects()) {
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

  /* -------------------------------------------------- */

  /**
   * Mutate the context for the biography tab
   * @param {object} context
   * @param {ApplicationRenderOptions} options
   */
  async _prepareBiographyTab(context, options) {
    // Text Enrichment is a foundry-specific implementation of RegEx that transforms text like [[/r 1d20]] into a clickable link
    // It's needed for the nice "display" version of the prosemirror editors
    const TextEditor = foundry.applications.ux.TextEditor.implementation;

    // One common pitfall with reusing enrichment options is that they are passed by reference to descendent functions
    // This can cause problems with foundry's Embed Depth handling, so always destructure with { ...options } when passing to a new enrichHTML call
    const enrichmentOptions = {
      secrets: this.actor.isOwner,
      rollData: this.actor.getRollData(),
      relativeTo: this.actor,
    };

    context.enrichedBiography = await TextEditor.enrichHTML(this.actor.system.biography.value, { ...enrichmentOptions });

    context.enrichedGMNotes = await TextEditor.enrichHTML(this.actor.system.biography.gm, { ...enrichmentOptions });
  }

  /* -------------------------------------------------- */

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   * @inheritdoc
   */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this.#disableOverrides();
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
   * @this SystemActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async #viewDoc(event, target) {
    const doc = this._getEmbeddedDocument(target);
    doc.sheet.render(true);
  }

  /* -------------------------------------------------- */

  /**
   * Handles item deletion
   *
   * @this SystemActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async #deleteDoc(event, target) {
    const doc = this._getEmbeddedDocument(target);
    doc.delete();
  }

  /* -------------------------------------------------- */

  /**
   * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
   *
   * @this SystemActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async #createDoc(event, target) {
    const docCls = getDocumentClass(target.dataset.documentClass);
    const docData = {
      name: docCls.defaultName({
        type: target.dataset.type,
        parent: this.actor,
      }),
    };
    for (const [dataKey, value] of Object.entries(target.dataset)) {
      if (["action", "documentClass"].includes(dataKey)) continue;
      foundry.utils.setProperty(docData, dataKey, value);
    }
    docCls.create(docData, { parent: this.actor });
  }

  /* -------------------------------------------------- */

  /**
   * Determines effect parent to pass to helper
   *
   * @this SystemActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async #toggleEffect(event, target) {
    const effect = this._getEmbeddedDocument(target);
    effect.update({ disabled: !effect.disabled });
  }

  /* -------------------------------------------- */
  /*  Drag and Drop                               */
  /* -------------------------------------------- */

  /* -------------------------------------------------- */
  /*   Helper functions                                 */
  /* -------------------------------------------------- */

  /**
   * Fetches the embedded document representing the containing HTML element
   *
   * @param {HTMLElement} target      The element subject to search
   * @returns {Item|ActiveEffect}     The embedded Item or ActiveEffect
   */
  _getEmbeddedDocument(target) {
    const docRow = target.closest("li[data-document-class]");
    if (docRow.dataset.documentClass === "Item") {
      return this.actor.items.get(docRow.dataset.itemId);
    } else if (docRow.dataset.documentClass === "ActiveEffect") {
      const parent = docRow.dataset.parentId === this.actor.id ?
        this.actor :
        this.actor.items.get(docRow?.dataset.parentId);
      return parent.effects.get(docRow.dataset.effectId);
    } else {
      console.warn("Could not find document class");
    }
  }

  /* -------------------------------------------------- */

  /**
   * Disables inputs subject to active effects
   */
  #disableOverrides() {
    const flatOverrides = foundry.utils.flattenObject(this.actor.overrides);
    for (const override of Object.keys(flatOverrides)) {
      const input = this.element.querySelector(`[name="${override}"]`);
      if (input) input.disabled = true;
    }
  }
}
