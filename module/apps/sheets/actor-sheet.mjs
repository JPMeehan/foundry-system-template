const {api, sheets} = foundry.applications;

export default class SystemActorSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {}
