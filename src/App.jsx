import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Cpu, Database, HardDrive, Waves, Settings2, LayoutGrid, ListChecks,
  Library, Plus, Trash2, Copy, Pencil, X, RotateCcw, Info, ChevronDown,
  Layers, AlertTriangle, Upload, Download, GitCompare, Check, Table2, Zap, Search, MessageSquare,
  BookMarked, Save, FolderOpen
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, Legend
} from "recharts";

/* ============================================================================
   CONSTANTS
============================================================================ */

const CATS = ["DigitalGO1", "DigitalGO2", "Memory", "NVM", "Analog"];

const CATEGORY_META = {
  DigitalGO1: { label: "Digital GO1 (cœur)", short: "GO1", color: "#45D9C6", icon: Cpu, unit: "kGates" },
  DigitalGO2: { label: "Digital GO2 (I/O, tension haute)", short: "GO2", color: "#3FA8C9", icon: Zap, unit: "kGates" },
  Memory:  { label: "Mémoire (volatile)", short: "MEM", color: "#A78BFA", icon: Database, unit: "Mb" },
  NVM:     { label: "Mémoire non-volatile", short: "NVM", color: "#F2688A", icon: HardDrive, unit: "Mb" },
  Analog:  { label: "Analogique / Mixed-Signal", short: "ANA", color: "#F2A65A", icon: Waves, unit: "mm²" },
};
const IO_COLOR = "#5B6572";
const OVERHEAD_COLOR = "#232A36";
const SEALRING_COLOR = "#3A4356";

/* ============================================================================
   I18N — FR / EN
============================================================================ */

const LangContext = React.createContext({ lang: "fr", setLang: () => {} });
function useLang() { return React.useContext(LangContext); }

const CAT_LABELS = {
  fr: {
    DigitalGO1: "Digital GO1 (cœur)", DigitalGO2: "Digital GO2 (I/O, tension haute)",
    Memory: "Mémoire (volatile)", NVM: "Mémoire non-volatile", Analog: "Analogique / Mixed-Signal",
  },
  en: {
    DigitalGO1: "Digital GO1 (core)", DigitalGO2: "Digital GO2 (I/O, high voltage)",
    Memory: "Memory (volatile)", NVM: "Non-volatile memory", Analog: "Analog / Mixed-Signal",
  },
};
const CAT_SHORT = {
  fr: { DigitalGO1: "GO1", DigitalGO2: "GO2", Memory: "MEM", NVM: "NVM", Analog: "ANA" },
  en: { DigitalGO1: "GO1", DigitalGO2: "GO2", Memory: "MEM", NVM: "NVM", Analog: "ANA" },
};
const CAT_UNIT = {
  fr: { DigitalGO1: "kGates", DigitalGO2: "kGates", Memory: "Mb", NVM: "Mb", Analog: "mm²" },
  en: { DigitalGO1: "kGates", DigitalGO2: "kGates", Memory: "Mb", NVM: "Mb", Analog: "mm²" },
};

function pl(n, s, p) { return n > 1 ? p : s; }

const I18N = {
  fr: {
    appTitle: "DieEstimator",
    appSubtitle: (node) => `Estimateur de surface SoC — ${node}`,
    reset: "Réinitialiser",
    resetConfirm: "Réinitialiser toutes les données (bibliothèque, technologie, scénarios) ?",
    loading: "Chargement de l'atelier de conception…",
    tabLibrary: "Bibliothèque IP", tabTech: "Technologie", tabScenario: "Scénarios (BOM)",
    tabScenarioLibrary: "Bibliothèque de scénarios", tabMatrix: "Matrice Scénarios",
    tabFloorplan: "Vue puce", tabCompare: "Comparer",

    add: "Ajouter", cancel: "Annuler", deleteBtn: "Supprimer", overwrite: "Écraser",
    duplicate: "Dupliquer", exportBtn: "Exporter", exportAll: "Tout exporter",
    importBtn: "Importer", importAll: "Tout importer", save: "Enregistrer", load: "Charger", newBtn: "Nouveau",
    all: "Toutes",

    libAddTitle: "Ajouter une IP", libEditTitle: "Modifier l'IP",
    fieldName: "Nom du bloc", namePlaceholder: "ex : NPU accélérateur",
    fieldCategory: "Catégorie", fieldSizingMethod: "Méthode de dimensionnement",
    parametric: "Paramétrique", fixedAreaMode: "Surface fixe",
    fieldQty: (u) => `Quantité (${u})`, fieldArea: "Surface",
    fieldComment: "Commentaire (optionnel)",
    commentPlaceholder: "ex : source, statut de qualification, version, dépendances…",
    estimatedUnitArea: "Surface unitaire estimée :",
    saveChanges: "Enregistrer les modifications", addToLibrary: "Ajouter à la bibliothèque",
    ipLibraryTitle: "Bibliothèque d'IP",
    exportAllTip: "Exporter toute la bibliothèque en un seul CSV",
    importAllTip: "Importer un CSV multi-catégories (colonne category requise)",
    searchIpPlaceholder: "Rechercher une IP par nom ou commentaire…",
    noIpMatchSearch: (q) => `Aucune IP ne correspond à « ${q} ».`,
    exportCatTip: (c) => `Exporter ${c} en CSV`,
    importCatTip: (c) => `Importer des IP ${c} depuis un CSV`,
    noIpInCategory: "Aucune IP dans cette catégorie.",
    unitPerUnit: "/ unité", perUnit2: "mm²/u",
    importModalTitle: (fn) => `Importer « ${fn} »`,
    ipsFoundFor: (n, scope) => `${n} IP trouvée${pl(n, "", "s")} pour ${scope}`,
    ignoredLines: (n) => `${n} ligne(s) ignorée(s)`,
    addOrOverwriteIp: (scope, label) => `Ajouter ces IP à ${scope === "all" ? "la bibliothèque existante" : `la catégorie ${label}`}, ou remplacer ${scope === "all" ? "toute la bibliothèque existante" : "les IP existantes de cette catégorie"} ?`,
    wholeLibrary: "toute la bibliothèque",
    ipsImportedMsg: (count, errCount) => `${count} IP importée${pl(count, "", "s")}${errCount ? `, ${errCount} ligne(s) ignorée(s)` : ""}.`,
    noValidIpFound: "Aucune IP valide trouvée dans le fichier.",
    cantReadFile: "Impossible de lire le fichier.",

    techNode: "Nœud technologique",
    exportTechTip: "Exporter les paramètres technologiques en CSV",
    importTechTip: "Importer des paramètres technologiques depuis un CSV",
    paramsImportedMsg: (count, errCount) => `${count} paramètre${pl(count, "", "s")} importé${pl(count, "", "s")}${errCount ? `, ${errCount} ligne(s) ignorée(s)` : ""}.`,
    pdkNote: "Valeurs indicatives génériques — à remplacer par les données de votre PDK / fondeur pour un chiffrage précis.",
    fieldNodeName: "Nom du nœud",
    techDensityTitle: "Paramètres de densité & overhead",
    fieldDensityGO1: "Densité logique digitale GO1 (cœur)", fieldDensityGO2: "Densité logique digitale GO2 (I/O)",
    fieldUtilization: "Utilisation du die (efficacité floorplan)",
    fieldSramBitcell: "Taille bitcell SRAM", fieldSramOverhead: "Overhead périphérie SRAM",
    fieldNvmBitcell: "Taille bitcell NVM", fieldNvmOverhead: "Overhead périphérie NVM",
    fieldAnalogOverhead: "Overhead IP analogiques", fieldIoPitch: "Pitch des plots IO",
    fieldSealRing: "Largeur seal ring (par côté)", fieldSawLane: "Largeur sawlane (rue de découpe)",

    scenariosTitle: "Scénarios",
    exportAllScenariosTip: "Exporter tous les scénarios en un seul CSV",
    importScenariosTip: "Importer des scénarios depuis un CSV",
    scenariosImportedMsg: (count, errCount) => `${count} scénario${pl(count, "", "s")} importé${pl(count, "", "s")}${errCount ? `, ${errCount} ligne(s) ignorée(s)` : ""}.`,
    noValidScenarioFound: "Aucun scénario valide trouvé dans le fichier.",
    saveAsTemplateTip: "Enregistrer une copie de ce scénario dans la bibliothèque de scénarios",
    saveAsTemplate: "Enregistrer comme modèle",
    fieldIoCount: "Nombre de plots IO",
    globalSealSawNote: (pitch) => `Seal ring et sawlane sont définis globalement dans l'onglet Technologie · Pas de découpe (die + sawlane) : ${pitch}`,
    bomContent: "Contenu (BOM)",
    noIpMatchFilters: "Aucune IP ne correspond à ces filtres.",
    modifyComment: "Modifier le commentaire", addComment: "Ajouter un commentaire",
    scenariosFoundCount: (n) => `${n} scénario${pl(n, "", "s")} trouvé${pl(n, "", "s")}`,
    addOrOverwriteScenarios: (n) => `Ajouter ${n > 1 ? "ces scénarios" : "ce scénario"} à la liste existante, ou remplacer tous les scénarios existants par ceux du fichier ?`,
    summary: "Résumé", categoryBreakdown: "Répartition par catégorie",

    dieSizeWithSeal: "Taille du die estimée (avec seal ring)",
    coreAreaIps: "Surface cœur (IPs)",
    floorplanOverhead: (pct) => `Overhead floorplan (${pct}%)`,
    ioLimitedArea: (n) => `Surface limitée par IO (${n} plots)`,
    ioLimitedBadge: "Limité par le pad ring (IO-limited)", coreLimitedBadge: "Limité par le contenu logique (core-limited)",
    sideBeforeSeal: "Côté avant seal ring",
    sealRingLabel: (um) => `Seal ring (${um} µm / côté)`,
    sawLaneLabel: "Sawlane (rue de découpe)",
    diePitchLabel: "Pas de découpe sur wafer (die + sawlane)",

    chipViewTitle: (name) => `Vue puce — ${name}`,
    overheadFloorplan: "Overhead floorplan", padRing: (n) => `Pad ring (${n} IO)`,
    sealRingParen: (um) => `Seal ring (${um} µm)`,
    waferPitchNote: (um, pitch) => `Pas de placement sur wafer (die + sawlane de ${um} µm) : ${pitch}`,
    topContributors: "Top contributeurs", noContentInScenario: "Aucun contenu dans ce scénario.",

    scenariosToCompare: "Scénarios à comparer",
    selectAtLeastOne: "Sélectionnez au moins un scénario à comparer.",
    silhouettes: "Silhouettes (échelle commune)",
    areaByCategory: "Surface par catégorie",
    comparisonTable: "Tableau comparatif", metric: "Métrique",
    dieSizeMetric: "Taille du die", totalDieArea: "Surface totale die", coreAreaMetric: "Surface cœur (IPs)",
    ioCountMetric: "Nombre de plots IO", ioLimitedAreaMetric: "Surface limitée par IO",
    limiterMetric: "Limiteur", ioLimitedShort: "IO-limited", coreLimitedShort: "Core-limited",
    sealRingAdded: "Seal ring ajouté", diePitchMetric: "Pas de découpe (die + sawlane)",

    matrixScenarios: "Matrice des scénarios", newScenario: "Nouveau scénario",
    ipVsScenario: "IP \\ Scénario", physicalParams: "Paramètres physiques", noIp: "Aucune IP",
    dieSize: "Taille du die", totalArea: "Surface totale", limiter: "Limiteur",

    scenarioLibraryTitle: "Bibliothèque de scénarios",
    exportAllTemplatesTip: "Exporter toute la bibliothèque de scénarios en un seul CSV",
    importTemplatesTip: "Importer des scénarios-modèles depuis un CSV",
    libraryNote: "Ces scénarios-modèles sont indépendants de vos scénarios actifs. Utilisez « Charger » pour copier un modèle dans l'onglet Scénarios, ou enregistrez un scénario actif ici depuis son bouton « Enregistrer comme modèle ».",
    searchTemplatePlaceholder: "Rechercher un scénario-modèle par nom…",
    noTemplateYet: "Aucun scénario-modèle enregistré pour l'instant.",
    noTemplateMatch: "Aucun modèle ne correspond à cette recherche.",
    templateMeta: (n, io, dim) => `${n} IP renseignée${pl(n, "", "s")} · ${io} plots IO · die estimé ${dim}`,
    loadTemplateTip: "Charger ce modèle comme nouveau scénario actif",
    addOrOverwriteTemplates: (n) => `Ajouter ${n > 1 ? "ces modèles" : "ce modèle"} à la bibliothèque existante, ou remplacer toute la bibliothèque de scénarios par ceux du fichier ?`,

    commentModalTitle: (name) => `Commentaire — ${name}`,
    commentPlaceholder2: "Note sur cette ligne du BOM (statut, risque, dépendance…)",

    ipTrouveePour: (n, label) => `${n} IP trouvée${pl(n, "", "s")} pour ${label}`,

    csvEmptyFile: "Fichier vide ou sans ligne de données.",
    csvNoNameCol: "Colonne 'name' introuvable dans l'en-tête.",
    csvNoCategoryCol: "Colonne 'category' introuvable (importez plutôt ce fichier dans la section d'une catégorie précise).",
    csvLineMissingName: (n) => `Ligne ${n} ignorée (nom manquant).`,
    csvLineInvalidCategory: (n, cat) => `Ligne ${n} ignorée (catégorie invalide : "${cat}").`,
    csvNoParamValueCols: "Colonnes 'param' et 'value' introuvables dans l'en-tête.",
    csvLineUnknownParam: (n, p) => `Ligne ${n} ignorée (paramètre inconnu : "${p}").`,
    csvLineInvalidNumber: (n, p) => `Ligne ${n} ignorée (valeur numérique invalide pour "${p}").`,
    csvNoScenarioCols: "Aucune colonne de scénario trouvée dans l'en-tête (colonne 1 = IP, colonnes suivantes = scénarios).",
    csvIpNotFound: (scName, ipName) => `Scénario "${scName}" : IP "${ipName}" introuvable dans la bibliothèque actuelle, ignorée.`,
  },
  en: {
    appTitle: "DieEstimator",
    appSubtitle: (node) => `SoC area estimator — ${node}`,
    reset: "Reset",
    resetConfirm: "Reset all data (library, technology, scenarios)?",
    loading: "Loading design workbench…",
    tabLibrary: "IP Library", tabTech: "Technology", tabScenario: "Scenarios (BOM)",
    tabScenarioLibrary: "Scenario Library", tabMatrix: "Scenario Matrix",
    tabFloorplan: "Chip View", tabCompare: "Compare",

    add: "Add", cancel: "Cancel", deleteBtn: "Delete", overwrite: "Overwrite",
    duplicate: "Duplicate", exportBtn: "Export", exportAll: "Export all",
    importBtn: "Import", importAll: "Import all", save: "Save", load: "Load", newBtn: "New",
    all: "All",

    libAddTitle: "Add an IP", libEditTitle: "Edit IP",
    fieldName: "Block name", namePlaceholder: "e.g.: NPU accelerator",
    fieldCategory: "Category", fieldSizingMethod: "Sizing method",
    parametric: "Parametric", fixedAreaMode: "Fixed area",
    fieldQty: (u) => `Quantity (${u})`, fieldArea: "Area",
    fieldComment: "Comment (optional)",
    commentPlaceholder: "e.g.: source, qualification status, version, dependencies…",
    estimatedUnitArea: "Estimated unit area:",
    saveChanges: "Save changes", addToLibrary: "Add to library",
    ipLibraryTitle: "IP Library",
    exportAllTip: "Export the whole library as a single CSV",
    importAllTip: "Import a multi-category CSV (category column required)",
    searchIpPlaceholder: "Search an IP by name or comment…",
    noIpMatchSearch: (q) => `No IP matches "${q}".`,
    exportCatTip: (c) => `Export ${c} as CSV`,
    importCatTip: (c) => `Import ${c} IPs from a CSV`,
    noIpInCategory: "No IP in this category.",
    unitPerUnit: "/ unit", perUnit2: "mm²/unit",
    importModalTitle: (fn) => `Import "${fn}"`,
    ipsFoundFor: (n, scope) => `${n} IP${pl(n, "", "s")} found for ${scope}`,
    ignoredLines: (n) => `${n} line(s) skipped`,
    addOrOverwriteIp: (scope, label) => `Add these IPs to ${scope === "all" ? "the existing library" : `the ${label} category`}, or overwrite ${scope === "all" ? "the whole existing library" : "the existing IPs in this category"}?`,
    wholeLibrary: "the whole library",
    ipsImportedMsg: (count, errCount) => `${count} IP${pl(count, "", "s")} imported${errCount ? `, ${errCount} line(s) skipped` : ""}.`,
    noValidIpFound: "No valid IP found in the file.",
    cantReadFile: "Unable to read the file.",

    techNode: "Technology node",
    exportTechTip: "Export technology parameters as CSV",
    importTechTip: "Import technology parameters from a CSV",
    paramsImportedMsg: (count, errCount) => `${count} parameter${pl(count, "", "s")} imported${errCount ? `, ${errCount} line(s) skipped` : ""}.`,
    pdkNote: "Generic indicative values — replace with your PDK / foundry data for an accurate estimate.",
    fieldNodeName: "Node name",
    techDensityTitle: "Density & overhead parameters",
    fieldDensityGO1: "Digital logic density GO1 (core)", fieldDensityGO2: "Digital logic density GO2 (I/O)",
    fieldUtilization: "Die utilization (floorplan efficiency)",
    fieldSramBitcell: "SRAM bitcell size", fieldSramOverhead: "SRAM periphery overhead",
    fieldNvmBitcell: "NVM bitcell size", fieldNvmOverhead: "NVM periphery overhead",
    fieldAnalogOverhead: "Analog IP overhead", fieldIoPitch: "IO pad pitch",
    fieldSealRing: "Seal ring width (per side)", fieldSawLane: "Sawlane width (scribe line)",

    scenariosTitle: "Scenarios",
    exportAllScenariosTip: "Export all scenarios as a single CSV",
    importScenariosTip: "Import scenarios from a CSV",
    scenariosImportedMsg: (count, errCount) => `${count} scenario${pl(count, "", "s")} imported${errCount ? `, ${errCount} line(s) skipped` : ""}.`,
    noValidScenarioFound: "No valid scenario found in the file.",
    saveAsTemplateTip: "Save a copy of this scenario in the scenario library",
    saveAsTemplate: "Save as template",
    fieldIoCount: "Number of IO pads",
    globalSealSawNote: (pitch) => `Seal ring and sawlane are set globally in the Technology tab · Wafer step pitch (die + sawlane): ${pitch}`,
    bomContent: "BOM content",
    noIpMatchFilters: "No IP matches these filters.",
    modifyComment: "Edit comment", addComment: "Add a comment",
    scenariosFoundCount: (n) => `${n} scenario${pl(n, "", "s")} found`,
    addOrOverwriteScenarios: (n) => `Add ${n > 1 ? "these scenarios" : "this scenario"} to the existing list, or overwrite all existing scenarios with those from the file?`,
    summary: "Summary", categoryBreakdown: "Breakdown by category",

    dieSizeWithSeal: "Estimated die size (with seal ring)",
    coreAreaIps: "Core area (IPs)",
    floorplanOverhead: (pct) => `Floorplan overhead (${pct}%)`,
    ioLimitedArea: (n) => `IO-limited area (${n} pads)`,
    ioLimitedBadge: "Limited by the pad ring (IO-limited)", coreLimitedBadge: "Limited by logic content (core-limited)",
    sideBeforeSeal: "Side before seal ring",
    sealRingLabel: (um) => `Seal ring (${um} µm / side)`,
    sawLaneLabel: "Sawlane (scribe line)",
    diePitchLabel: "Wafer step pitch (die + sawlane)",

    chipViewTitle: (name) => `Chip view — ${name}`,
    overheadFloorplan: "Floorplan overhead", padRing: (n) => `Pad ring (${n} IO)`,
    sealRingParen: (um) => `Seal ring (${um} µm)`,
    waferPitchNote: (um, pitch) => `Wafer placement pitch (die + ${um} µm sawlane): ${pitch}`,
    topContributors: "Top contributors", noContentInScenario: "No content in this scenario.",

    scenariosToCompare: "Scenarios to compare",
    selectAtLeastOne: "Select at least one scenario to compare.",
    silhouettes: "Silhouettes (common scale)",
    areaByCategory: "Area by category",
    comparisonTable: "Comparison table", metric: "Metric",
    dieSizeMetric: "Die size", totalDieArea: "Total die area", coreAreaMetric: "Core area (IPs)",
    ioCountMetric: "Number of IO pads", ioLimitedAreaMetric: "IO-limited area",
    limiterMetric: "Limiter", ioLimitedShort: "IO-limited", coreLimitedShort: "Core-limited",
    sealRingAdded: "Seal ring added", diePitchMetric: "Wafer step pitch (die + sawlane)",

    matrixScenarios: "Scenario matrix", newScenario: "New scenario",
    ipVsScenario: "IP \\ Scenario", physicalParams: "Physical parameters", noIp: "No IP",
    dieSize: "Die size", totalArea: "Total area", limiter: "Limiter",

    scenarioLibraryTitle: "Scenario library",
    exportAllTemplatesTip: "Export the whole scenario library as a single CSV",
    importTemplatesTip: "Import scenario templates from a CSV",
    libraryNote: "These scenario templates are independent from your active scenarios. Use \u201CLoad\u201D to copy a template into the Scenarios tab, or save an active scenario here from its \u201CSave as template\u201D button.",
    searchTemplatePlaceholder: "Search a scenario template by name…",
    noTemplateYet: "No scenario template saved yet.",
    noTemplateMatch: "No template matches this search.",
    templateMeta: (n, io, dim) => `${n} IP${pl(n, "", "s")} set · ${io} IO pads · estimated die ${dim}`,
    loadTemplateTip: "Load this template as a new active scenario",
    addOrOverwriteTemplates: (n) => `Add ${n > 1 ? "these templates" : "this template"} to the existing library, or overwrite the whole scenario library with those from the file?`,

    commentModalTitle: (name) => `Comment — ${name}`,
    commentPlaceholder2: "Note about this BOM line (status, risk, dependency…)",

    ipTrouveePour: (n, label) => `${n} IP${pl(n, "", "s")} found for ${label}`,

    csvEmptyFile: "Empty file or no data row.",
    csvNoNameCol: "Column 'name' not found in the header.",
    csvNoCategoryCol: "Column 'category' not found (import this file into a specific category section instead).",
    csvLineMissingName: (n) => `Line ${n} skipped (missing name).`,
    csvLineInvalidCategory: (n, cat) => `Line ${n} skipped (invalid category: "${cat}").`,
    csvNoParamValueCols: "Columns 'param' and 'value' not found in the header.",
    csvLineUnknownParam: (n, p) => `Line ${n} skipped (unknown parameter: "${p}").`,
    csvLineInvalidNumber: (n, p) => `Line ${n} skipped (invalid numeric value for "${p}").`,
    csvNoScenarioCols: "No scenario column found in the header (column 1 = IP, following columns = scenarios).",
    csvIpNotFound: (scName, ipName) => `Scenario "${scName}": IP "${ipName}" not found in the current library, skipped.`,
  },
};

const NODE_PRESETS = [
  { name: "180 nm", digitalDensityGO1: 15,  digitalDensityGO2: 6,   sramBitCellArea: 4.5,  nvmBitCellArea: 8.0,  ioPadPitch: 120 },
  { name: "90 nm",  digitalDensityGO1: 60,  digitalDensityGO2: 24,  sramBitCellArea: 1.4,  nvmBitCellArea: 2.5,  ioPadPitch: 90  },
  { name: "65 nm",  digitalDensityGO1: 100, digitalDensityGO2: 40,  sramBitCellArea: 0.65, nvmBitCellArea: 1.2,  ioPadPitch: 75  },
  { name: "40 nm",  digitalDensityGO1: 180, digitalDensityGO2: 72,  sramBitCellArea: 0.29, nvmBitCellArea: 0.55, ioPadPitch: 65  },
  { name: "28 nm",  digitalDensityGO1: 260, digitalDensityGO2: 105, sramBitCellArea: 0.127,nvmBitCellArea: 0.30, ioPadPitch: 55  },
  { name: "16 nm",  digitalDensityGO1: 450, digitalDensityGO2: 180, sramBitCellArea: 0.074,nvmBitCellArea: 0.16, ioPadPitch: 45  },
  { name: "7 nm",   digitalDensityGO1: 900, digitalDensityGO2: 360, sramBitCellArea: 0.027,nvmBitCellArea: 0.08, ioPadPitch: 40  },
];

const uid = () => Math.random().toString(36).slice(2, 10);

const fmt = (n, d = 3) => {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
};
const fmt0 = (n) => (n === null || n === undefined || Number.isNaN(n) ? "—" : Math.round(n).toLocaleString("fr-FR"));

/* ============================================================================
   CSV IMPORT / EXPORT
============================================================================ */

function csvEscape(v) {
  const s = String(v ?? "");
  if (/[",;\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function ipsToCSV(library) {
  const header = ["name", "category", "mode", "metric_value", "fixed_area_mm2", "comment"];
  const rows = library.map((ip) => [
    ip.name,
    ip.category,
    ip.mode,
    ip.mode === "parametric" ? ip.metricValue : "",
    ip.mode === "fixed" ? ip.fixedArea : "",
    ip.comment || "",
  ]);
  return [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\r\n");
}

function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (!(row.length === 1 && row[0] === "")) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function importIpsFromCSV(text, forcedCategory, lang) {
  const t = I18N[lang === "en" ? "en" : "fr"];
  const rows = parseCSV(text).filter((r) => r.some((c) => String(c).trim() !== ""));
  if (rows.length < 2) return { ips: [], errors: [t.csvEmptyFile] };
  const header = rows[0].map((h) => String(h).trim().toLowerCase());
  const idx = (names) => header.findIndex((h) => names.includes(h));
  const iName = idx(["name", "nom"]);
  const iCat = idx(["category", "categorie", "catégorie"]);
  const iMode = idx(["mode", "methode", "méthode"]);
  const iMetric = idx(["metric_value", "valeur", "quantite", "quantité"]);
  const iFixed = idx(["fixed_area_mm2", "fixed_area", "surface", "surface_mm2", "area"]);
  const iComment = idx(["comment", "commentaire", "notes", "note", "remarque", "remarques"]);

  if (iName === -1) {
    return { ips: [], errors: [t.csvNoNameCol] };
  }
  if (!forcedCategory && iCat === -1) {
    return { ips: [], errors: [t.csvNoCategoryCol] };
  }

  const ips = [];
  const errors = [];
  rows.slice(1).forEach((r, i) => {
    const lineNo = i + 2;
    const name = String(r[iName] || "").trim();
    if (!name) { errors.push(t.csvLineMissingName(lineNo)); return; }
    let cat = forcedCategory;
    if (!cat) {
      const catRaw = String(r[iCat] || "").trim();
      cat = CATS.find((c) => c.toLowerCase() === catRaw.toLowerCase());
      if (!cat) { errors.push(t.csvLineInvalidCategory(lineNo, catRaw)); return; }
    }
    let mode = iMode !== -1 ? String(r[iMode] || "").trim().toLowerCase() : "";
    if (mode !== "fixed" && mode !== "parametric") mode = cat === "Analog" ? "fixed" : "parametric";
    const num = (v) => {
      const n = Number(String(v ?? "").replace(",", "."));
      return Number.isFinite(n) ? n : 0;
    };
    const metricValue = iMetric !== -1 ? num(r[iMetric]) : 0;
    const fixedArea = iFixed !== -1 ? num(r[iFixed]) : 0;
    const comment = iComment !== -1 ? String(r[iComment] || "").trim() : "";
    ips.push({ id: uid(), name, category: cat, mode, metricValue, fixedArea, comment });
  });
  return { ips, errors };
}

function downloadTextFile(filename, content, mime) {
  const blob = new Blob(["\uFEFF" + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---- technology node parameters CSV ---- */

const TECH_FIELDS = [
  { key: "nodeName", aliases: ["node_name", "nom_noeud", "noeud", "node"], label: "Nom du nœud", type: "string" },
  { key: "digitalDensityGO1", aliases: ["digital_density_go1_kgates_mm2", "digital_density_go1", "densite_digitale_go1"], label: "Densité digitale GO1 (kGates/mm²)", type: "number" },
  { key: "digitalDensityGO2", aliases: ["digital_density_go2_kgates_mm2", "digital_density_go2", "densite_digitale_go2"], label: "Densité digitale GO2 (kGates/mm²)", type: "number" },
  { key: "sramBitCellArea", aliases: ["sram_bitcell_area_um2", "sram_bitcell", "bitcell_sram"], label: "Bitcell SRAM (µm²/bit)", type: "number" },
  { key: "sramOverheadPct", aliases: ["sram_overhead_pct", "sram_overhead"], label: "Overhead périphérie SRAM (%)", type: "number" },
  { key: "nvmBitCellArea", aliases: ["nvm_bitcell_area_um2", "nvm_bitcell", "bitcell_nvm"], label: "Bitcell NVM (µm²/bit)", type: "number" },
  { key: "nvmOverheadPct", aliases: ["nvm_overhead_pct", "nvm_overhead"], label: "Overhead périphérie NVM (%)", type: "number" },
  { key: "analogOverheadPct", aliases: ["analog_overhead_pct", "analog_overhead", "overhead_analogique"], label: "Overhead IP analogiques (%)", type: "number" },
  { key: "areaUtilization", aliases: ["area_utilization_pct", "utilisation_pct", "die_utilization"], label: "Utilisation du die (%)", type: "number" },
  { key: "ioPadPitch", aliases: ["io_pad_pitch_um", "io_pad_pitch", "pad_pitch"], label: "Pitch des plots IO (µm)", type: "number" },
  { key: "sealRingWidth", aliases: ["seal_ring_width_um", "seal_ring_width", "largeur_seal_ring"], label: "Largeur seal ring (µm)", type: "number" },
  { key: "sawLaneWidth", aliases: ["saw_lane_width_um", "saw_lane_width", "largeur_sawlane"], label: "Largeur sawlane (µm)", type: "number" },
];

function techToCSV(tech) {
  const header = ["param", "value"];
  const rows = TECH_FIELDS.map((f) => [f.aliases[0], tech[f.key]]);
  return [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\r\n");
}

function parseTechCSV(text, lang) {
  const t = I18N[lang === "en" ? "en" : "fr"];
  const rows = parseCSV(text).filter((r) => r.some((c) => String(c).trim() !== ""));
  if (rows.length < 2) return { patch: {}, errors: [t.csvEmptyFile], found: 0 };
  const header = rows[0].map((h) => String(h).trim().toLowerCase());
  const iParam = header.findIndex((h) => ["param", "parametre", "paramètre", "key", "name"].includes(h));
  const iValue = header.findIndex((h) => ["value", "valeur"].includes(h));
  if (iParam === -1 || iValue === -1) {
    return { patch: {}, errors: [t.csvNoParamValueCols], found: 0 };
  }
  const patch = {};
  const errors = [];
  let found = 0;
  rows.slice(1).forEach((r, i) => {
    const lineNo = i + 2;
    const paramRaw = String(r[iParam] || "").trim().toLowerCase();
    const valueRaw = String(r[iValue] || "").trim();
    if (!paramRaw) return;
    const field = TECH_FIELDS.find((f) => f.aliases.includes(paramRaw) || f.key.toLowerCase() === paramRaw);
    if (!field) { errors.push(t.csvLineUnknownParam(lineNo, paramRaw)); return; }
    if (field.type === "number") {
      const n = Number(valueRaw.replace(",", "."));
      if (!Number.isFinite(n)) { errors.push(t.csvLineInvalidNumber(lineNo, paramRaw)); return; }
      patch[field.key] = n;
    } else {
      patch[field.key] = valueRaw;
    }
    found++;
  });
  return { patch, errors, found };
}

/* ---- scenarios (BOM) CSV ---- */

function scenariosToCSV(scenarios, library) {
  const header = ["IP", ...scenarios.map((sc) => sc.name)];
  const blank = () => scenarios.map(() => "");
  const rows = [];
  CATS.forEach((cat) => {
    const catIps = library.filter((ip) => ip.category === cat);
    if (catIps.length === 0) return;
    rows.push([`## ${CATEGORY_META[cat].label}`, ...blank()]);
    catIps.forEach((ip) => {
      rows.push([
        ip.name,
        ...scenarios.map((sc) => {
          const item = sc.items.find((it) => it.ipId === ip.id);
          return item ? Number(item.qty) || 0 : 0;
        }),
      ]);
    });
  });
  rows.push([`## Paramètres physiques`, ...blank()]);
  rows.push(["Nombre de plots IO", ...scenarios.map((sc) => sc.ioCount)]);
  return [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\r\n");
}

const SCENARIO_SPECIAL_ROWS = {
  "nombre de plots io": "ioCount", "plots io": "ioCount", "io_count": "ioCount", "iocount": "ioCount",
};
// Seal ring / sawlane used to be per-scenario; they now live in the Technology section.
// Rows with these legacy labels are silently skipped on import instead of being treated as (unmatched) IP names.
const SCENARIO_LEGACY_IGNORED_ROWS = new Set([
  "largeur seal ring (µm)", "seal ring", "seal_ring_width_um", "sealringwidth",
  "largeur sawlane (µm)", "sawlane", "saw_lane_width_um", "sawlanewidth",
]);

function parseScenariosCSV(text, library, lang) {
  const t = I18N[lang === "en" ? "en" : "fr"];
  const rows = parseCSV(text).filter((r) => r.some((c) => String(c).trim() !== ""));
  if (rows.length < 2) return { scenarios: [], errors: [t.csvEmptyFile] };
  const header = rows[0];
  const scenarioNames = header.slice(1).map((h) => String(h).trim()).filter((h) => h !== "");
  if (scenarioNames.length === 0) {
    return { scenarios: [], errors: [t.csvNoScenarioCols] };
  }

  const num = (v) => { const n = Number(String(v ?? "").trim().replace(",", ".")); return Number.isFinite(n) ? n : 0; };
  const drafts = scenarioNames.map((name) => ({ name, ioCount: 100, itemsByName: {} }));

  rows.slice(1).forEach((r) => {
    const label = String(r[0] || "").trim();
    if (!label || label.startsWith("##")) return;
    if (SCENARIO_LEGACY_IGNORED_ROWS.has(label.toLowerCase())) return;
    const special = SCENARIO_SPECIAL_ROWS[label.toLowerCase()];
    scenarioNames.forEach((name, idx) => {
      const raw = r[idx + 1];
      if (raw === undefined || String(raw).trim() === "") return;
      const val = num(raw);
      if (special) drafts[idx][special] = val;
      else drafts[idx].itemsByName[label] = val;
    });
  });

  const errors = [];
  const scenarios = drafts.map((d) => {
    const usedKeys = new Set();
    const items = library.map((ip) => {
      const ipNameLower = ip.name.trim().toLowerCase();
      const matchKey = Object.keys(d.itemsByName).find((k) => k.trim().toLowerCase() === ipNameLower);
      if (matchKey) usedKeys.add(matchKey);
      return { ipId: ip.id, qty: matchKey ? d.itemsByName[matchKey] : 0 };
    });
    Object.keys(d.itemsByName).forEach((ipName) => {
      if (!usedKeys.has(ipName)) errors.push(t.csvIpNotFound(d.name, ipName));
    });
    return { id: uid(), name: d.name, ioCount: d.ioCount, items };
  });

  return { scenarios, errors };
}

/* ============================================================================
   DEFAULT DATA
============================================================================ */

function defaultLibrary() {
  return [
    { id: uid(), name: "CPU cluster (4x Cortex-A55)", category: "DigitalGO1", mode: "parametric", metricValue: 1800, fixedArea: 0, comment: "Hardened core, netlist fournisseur" },
    { id: uid(), name: "GPU", category: "DigitalGO1", mode: "parametric", metricValue: 2500, fixedArea: 0, comment: "" },
    { id: uid(), name: "Logique glue / périphériques", category: "DigitalGO1", mode: "parametric", metricValue: 400, fixedArea: 0, comment: "UART, SPI, I2C, GPIO, timers" },
    { id: uid(), name: "Contrôleur IO digital (haute tension)", category: "DigitalGO2", mode: "parametric", metricValue: 150, fixedArea: 0, comment: "Logique en cellules GO2, pilotage des plots" },
    { id: uid(), name: "SRAM L2 cache", category: "Memory", mode: "parametric", metricValue: 4, fixedArea: 0, comment: "" },
    { id: uid(), name: "SRAM système", category: "Memory", mode: "parametric", metricValue: 2, fixedArea: 0, comment: "" },
    { id: uid(), name: "Flash embarquée", category: "NVM", mode: "parametric", metricValue: 8, fixedArea: 0, comment: "Vérifier disponibilité fondeur sur ce nœud" },
    { id: uid(), name: "PLL (x4)", category: "Analog", mode: "fixed", metricValue: 0, fixedArea: 0.15, comment: "" },
    { id: uid(), name: "ADC/DAC mixed-signal", category: "Analog", mode: "fixed", metricValue: 0, fixedArea: 0.35, comment: "12-bit, 2x ADC + 1x DAC" },
    { id: uid(), name: "PMIC / LDO array", category: "Analog", mode: "fixed", metricValue: 0, fixedArea: 0.25, comment: "" },
    { id: uid(), name: "SerDes PHY (x2)", category: "Analog", mode: "fixed", metricValue: 0, fixedArea: 0.60, comment: "IP externe sous licence" },
  ];
}

function defaultTech() {
  const p = NODE_PRESETS[4]; // 28nm
  return {
    nodeName: p.name,
    digitalDensityGO1: p.digitalDensityGO1,
    digitalDensityGO2: p.digitalDensityGO2,
    sramBitCellArea: p.sramBitCellArea,
    sramOverheadPct: 40,
    nvmBitCellArea: p.nvmBitCellArea,
    nvmOverheadPct: 60,
    analogOverheadPct: 15,
    areaUtilization: 75,
    sealRingWidth: 120,
    sawLaneWidth: 80,
    ioPadPitch: p.ioPadPitch,
  };
}

function defaultScenarios(library) {
  const qtyFor = (name) => {
    const map = {
      "CPU cluster (4x Cortex-A55)": 1, "GPU": 1, "Logique glue / périphériques": 1,
      "Contrôleur IO digital (haute tension)": 1,
      "SRAM L2 cache": 1, "SRAM système": 1, "Flash embarquée": 1,
      "PLL (x4)": 1, "ADC/DAC mixed-signal": 1, "PMIC / LDO array": 1, "SerDes PHY (x2)": 1,
    };
    return map[name] || 0;
  };
  return [{
    id: uid(),
    name: "Scénario de base",
    ioCount: 180,
    items: library.map((ip) => ({ ipId: ip.id, qty: qtyFor(ip.name) })),
  }];
}

function defaultState() {
  const library = defaultLibrary();
  const scenarios = defaultScenarios(library);
  const scenarioLibrary = [
    { id: uid(), name: "Modèle — Scénario de base", ioCount: scenarios[0].ioCount, items: scenarios[0].items.map((it) => ({ ...it })) },
  ];
  return {
    library,
    tech: defaultTech(),
    scenarios,
    activeScenarioId: scenarios[0].id,
    scenarioLibrary,
    lang: "fr",
  };
}

// Seal ring / sawlane used to live per-scenario; they moved to the Technology section (global).
// If a saved state predates that change, carry the old value(s) over so existing setups don't silently reset to 0.
function migrateState(state) {
  if (!state || !state.tech) return state;
  const legacy = (state.scenarios || []).find((sc) => sc && (sc.sealRingWidth !== undefined || sc.sawLaneWidth !== undefined));
  if (legacy) {
    if (state.tech.sealRingWidth === undefined && legacy.sealRingWidth !== undefined) {
      state.tech.sealRingWidth = legacy.sealRingWidth;
    }
    if (state.tech.sawLaneWidth === undefined && legacy.sawLaneWidth !== undefined) {
      state.tech.sawLaneWidth = legacy.sawLaneWidth;
    }
  }
  if (state.tech.sealRingWidth === undefined) state.tech.sealRingWidth = 120;
  if (state.tech.sawLaneWidth === undefined) state.tech.sawLaneWidth = 80;
  if (!Array.isArray(state.scenarioLibrary)) state.scenarioLibrary = [];
  if (state.lang !== "en" && state.lang !== "fr") state.lang = "fr";
  return state;
}

/* ============================================================================
   COMPUTATION
============================================================================ */

function computeIpUnitArea(ip, tech) {
  if (!ip) return 0;
  let base;
  if (ip.mode === "fixed") {
    base = Number(ip.fixedArea) || 0;
  } else {
    const v = Number(ip.metricValue) || 0;
    if (ip.category === "DigitalGO1") {
      const density = Number(tech.digitalDensityGO1) || 1;
      base = v / density; // kGates / (kGates/mm2)
    } else if (ip.category === "DigitalGO2") {
      const density = Number(tech.digitalDensityGO2) || 1;
      base = v / density; // kGates / (kGates/mm2)
    } else if (ip.category === "Memory") {
      const bits = v * 1e6;
      const areaUm2 = bits * (Number(tech.sramBitCellArea) || 0) * (1 + (Number(tech.sramOverheadPct) || 0) / 100);
      base = areaUm2 / 1e6;
    } else if (ip.category === "NVM") {
      const bits = v * 1e6;
      const areaUm2 = bits * (Number(tech.nvmBitCellArea) || 0) * (1 + (Number(tech.nvmOverheadPct) || 0) / 100);
      base = areaUm2 / 1e6;
    } else {
      base = Number(ip.fixedArea) || 0;
    }
  }
  if (ip.category === "Analog") {
    base = base * (1 + (Number(tech.analogOverheadPct) || 0) / 100);
  }
  return base;
}

function computeScenario(scenario, library, tech) {
  const rows = (scenario?.items || [])
    .map((it) => {
      const ip = library.find((l) => l.id === it.ipId);
      if (!ip || !it.qty) return null;
      const unitArea = computeIpUnitArea(ip, tech);
      const totalArea = unitArea * Number(it.qty);
      if (totalArea <= 0) return null;
      return { ip, qty: Number(it.qty), unitArea, totalArea };
    })
    .filter(Boolean)
    .sort((a, b) => b.totalArea - a.totalArea);

  const coreArea = rows.reduce((s, r) => s + r.totalArea, 0);
  const utilization = Math.min(Math.max(Number(tech.areaUtilization) || 1, 1), 100) / 100;
  const dieAreaFromCore = utilization > 0 ? coreArea / utilization : coreArea;
  const coreSide = Math.sqrt(dieAreaFromCore);

  const ioCount = Number(scenario?.ioCount) || 0;
  const perimeterUm = ioCount * (Number(tech.ioPadPitch) || 0);
  const ioSide = (perimeterUm / 4) / 1000; // um -> mm, per side

  const ioLimited = ioSide > coreSide;
  const baseSide = Math.max(coreSide, ioSide, 0.01); // silicon needed for content + pad ring, before seal ring
  const baseArea = baseSide * baseSide;

  const sealRingWidth = Number(tech?.sealRingWidth) || 0; // µm, per side — global technology parameter
  const sealRingWidthMm = sealRingWidth / 1000;
  const finalSide = baseSide + 2 * sealRingWidthMm;
  const finalArea = finalSide * finalSide;
  const sealRingArea = Math.max(finalArea - baseArea, 0);

  const sawLaneWidth = Number(tech?.sawLaneWidth) || 0; // µm, per side (scribe/kerf between adjacent dies) — global technology parameter
  const sawLaneWidthMm = sawLaneWidth / 1000;
  const diePitch = finalSide + sawLaneWidthMm; // wafer step pitch (die + scribe lane), informational

  const byCategory = {};
  CATS.forEach((c) => (byCategory[c] = 0));
  rows.forEach((r) => (byCategory[r.ip.category] += r.totalArea));

  const overheadArea = Math.max(dieAreaFromCore - coreArea, 0);
  const ioExtraArea = Math.max(baseArea - dieAreaFromCore, 0);

  return {
    rows, coreArea, dieAreaFromCore, coreSide, ioSide, ioCount,
    ioLimited, baseSide, baseArea, sealRingWidthMm, sealRingArea,
    sawLaneWidthMm, diePitch, finalSide, finalArea, byCategory, overheadArea, ioExtraArea, utilization,
  };
}

/* ============================================================================
   SQUARIFIED TREEMAP
============================================================================ */

function worstRatio(row, side) {
  const sum = row.reduce((a, b) => a + b.sv, 0);
  let maxv = -Infinity, minv = Infinity;
  row.forEach((r) => { if (r.sv > maxv) maxv = r.sv; if (r.sv < minv) minv = r.sv; });
  const s2 = sum * sum, side2 = side * side;
  return Math.max((side2 * maxv) / s2, s2 / (side2 * minv));
}

function squarify(itemsIn, x, y, w, h) {
  const total = itemsIn.reduce((s, i) => s + i.value, 0);
  const out = [];
  if (total <= 0 || w <= 0 || h <= 0) return out;
  const scale = (w * h) / total;
  let remaining = itemsIn.map((i) => ({ ...i, sv: i.value * scale }));

  let cx = x, cy = y, cw = w, ch = h;
  while (remaining.length) {
    const side = Math.min(cw, ch);
    let row = [remaining[0]];
    let i = 1;
    while (i < remaining.length) {
      const next = [...row, remaining[i]];
      if (worstRatio(next, side) <= worstRatio(row, side)) { row = next; i++; }
      else break;
    }
    const rowSum = row.reduce((s, r) => s + r.sv, 0);
    const horizontal = cw >= ch;
    if (horizontal) {
      const rowW = rowSum / ch;
      let ry = cy;
      row.forEach((r) => {
        const rh = r.sv / rowW;
        out.push({ ...r, x: cx, y: ry, w: rowW, h: rh });
        ry += rh;
      });
      cx += rowW; cw -= rowW;
    } else {
      const rowH = rowSum / cw;
      let rx = cx;
      row.forEach((r) => {
        const rw = r.sv / rowH;
        out.push({ ...r, x: rx, y: cy, w: rw, h: rowH });
        rx += rw;
      });
      cy += rowH; ch -= rowH;
    }
    remaining = remaining.slice(row.length);
  }
  return out;
}

/* ============================================================================
   SMALL UI PRIMITIVES
============================================================================ */

function Field({ label, unit, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}{unit ? <span className="field-unit"> ({unit})</span> : null}</span>
      {children}
    </label>
  );
}

function NumInput(props) {
  return <input type="number" className="input" {...props} />;
}

function CatBadge({ category, size = "sm" }) {
  const meta = CATEGORY_META[category];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <span className={`badge badge-${size}`} style={{ "--badge-color": meta.color }}>
      <Icon size={size === "sm" ? 12 : 14} strokeWidth={2.4} />
      {meta.short}
    </span>
  );
}

function BomCommentModal({ ipName, initialComment, onSave, onDelete, onClose }) {
  const { lang } = useLang();
  const t = I18N[lang];
  const [text, setText] = useState(initialComment || "");
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h4>{t.commentModalTitle(ipName)}</h4>
        <textarea className="input textarea" rows={4} value={text} onChange={(e) => setText(e.target.value)}
          placeholder={t.commentPlaceholder2} autoFocus />
        <div className="modal-actions">
          {initialComment && (
            <button className="btn-ghost btn-ghost-danger" onClick={onDelete}><Trash2 size={13} /> {t.deleteBtn}</button>
          )}
          <button className="btn-ghost" onClick={onClose}>{t.cancel}</button>
          <button className="btn-primary" onClick={() => onSave(text)}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   TAB: LIBRARY
============================================================================ */

function emptyIpDraft() {
  return { id: null, name: "", category: "DigitalGO1", mode: "parametric", metricValue: 100, fixedArea: 0.1, comment: "" };
}

function LibraryTab({ library, tech, onAdd, onUpdate, onDelete, onImport }) {
  const { lang } = useLang();
  const t = I18N[lang];
  const [draft, setDraft] = useState(emptyIpDraft());
  const [editingId, setEditingId] = useState(null);
  const [importMsg, setImportMsg] = useState(null);
  const [pendingImport, setPendingImport] = useState(null); // { ips, errors, scope, fileName }
  const [collapsed, setCollapsed] = useState({});
  const [search, setSearch] = useState("");
  const fileInputRef = useRef(null);
  const importScopeRef = useRef("all");

  const matchesSearch = (ip) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return ip.name.toLowerCase().includes(q) || (ip.comment || "").toLowerCase().includes(q);
  };

  const startEdit = (ip) => { setDraft({ ...ip }); setEditingId(ip.id); };
  const cancelEdit = () => { setDraft(emptyIpDraft()); setEditingId(null); };
  const toggleCollapsed = (cat) => setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const handleExportAll = () => {
    downloadTextFile("bibliotheque-ip-toutes-categories.csv", ipsToCSV(library), "text/csv;charset=utf-8;");
  };
  const handleExportCategory = (cat) => {
    const subset = library.filter((ip) => ip.category === cat);
    downloadTextFile(`bibliotheque-ip-${cat.toLowerCase()}.csv`, ipsToCSV(subset), "text/csv;charset=utf-8;");
  };

  const handleImportClick = (scope) => {
    importScopeRef.current = scope; // "all" or a category name
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const scope = importScopeRef.current;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const forcedCategory = scope === "all" ? undefined : scope;
      const { ips, errors } = importIpsFromCSV(String(ev.target.result || ""), forcedCategory, lang);
      if (ips.length === 0) {
        setImportMsg({ count: 0, errors: errors.length ? errors : [t.noValidIpFound] });
        return;
      }
      setPendingImport({ ips, errors, scope, fileName: file.name });
    };
    reader.onerror = () => setImportMsg({ count: 0, errors: [t.cantReadFile] });
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  const resolvePendingImport = (mode) => {
    if (!pendingImport) return;
    onImport(pendingImport.ips, mode, pendingImport.scope);
    setImportMsg({ count: pendingImport.ips.length, errors: pendingImport.errors });
    setPendingImport(null);
  };
  const cancelPendingImport = () => setPendingImport(null);

  const submit = (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    if (editingId) onUpdate(editingId, draft);
    else onAdd({ ...draft, id: uid() });
    cancelEdit();
  };

  const previewArea = computeIpUnitArea(draft, tech);
  const scopeLabel = pendingImport ? (pendingImport.scope === "all" ? t.wholeLibrary : CATEGORY_META[pendingImport.scope].label) : "";

  return (
    <div className="grid-2">
      <div className="panel">
        <div className="panel-head">
          <h3>{editingId ? t.libEditTitle : t.libAddTitle}</h3>
          {editingId && <button className="icon-btn" onClick={cancelEdit}><X size={14} /></button>}
        </div>
        <form onSubmit={submit} className="form-stack">
          <Field label={t.fieldName}>
            <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder={t.namePlaceholder} />
          </Field>
          <Field label={t.fieldCategory}>
            <div className="segmented">
              {CATS.map((c) => (
                <button type="button" key={c}
                  className={"seg-btn" + (draft.category === c ? " seg-active" : "")}
                  style={{ "--seg-color": CATEGORY_META[c].color }}
                  onClick={() => setDraft({ ...draft, category: c, mode: c === "Analog" && draft.mode === "parametric" ? "fixed" : draft.mode })}>
                  {CATEGORY_META[c].short}
                </button>
              ))}
            </div>
          </Field>

          <Field label={t.fieldSizingMethod}>
            <div className="segmented">
              <button type="button" className={"seg-btn" + (draft.mode === "parametric" ? " seg-active" : "")}
                disabled={draft.category === "Analog"}
                onClick={() => setDraft({ ...draft, mode: "parametric" })}>{t.parametric}</button>
              <button type="button" className={"seg-btn" + (draft.mode === "fixed" ? " seg-active" : "")}
                onClick={() => setDraft({ ...draft, mode: "fixed" })}>{t.fixedAreaMode}</button>
            </div>
          </Field>

          {draft.mode === "parametric" ? (
            <Field label={t.fieldQty(CATEGORY_META[draft.category].unit)}>
              <NumInput value={draft.metricValue} min={0} step="any"
                onChange={(e) => setDraft({ ...draft, metricValue: e.target.value })} />
            </Field>
          ) : (
            <Field label={t.fieldArea} unit="mm²">
              <NumInput value={draft.fixedArea} min={0} step="any"
                onChange={(e) => setDraft({ ...draft, fixedArea: e.target.value })} />
            </Field>
          )}

          <Field label={t.fieldComment}>
            <textarea className="input textarea" rows={2} value={draft.comment || ""}
              onChange={(e) => setDraft({ ...draft, comment: e.target.value })}
              placeholder={t.commentPlaceholder} />
          </Field>

          <div className="preview-line">
            <Info size={13} />
            <span>{t.estimatedUnitArea} <strong>{fmt(previewArea, 4)} mm²</strong></span>
          </div>

          <button type="submit" className="btn-primary">
            {editingId ? t.saveChanges : <><Plus size={15} /> {t.addToLibrary}</>}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>{t.ipLibraryTitle} <span className="count-pill">{library.length}</span></h3>
          <div className="head-actions">
            <button className="btn-ghost" onClick={handleExportAll} title={t.exportAllTip}>
              <Download size={13} /> {t.exportAll}
            </button>
            <button className="btn-ghost" onClick={() => handleImportClick("all")} title={t.importAllTip}>
              <Upload size={13} /> {t.importAll}
            </button>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={handleFileChange} />

        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input className="input search-input" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchIpPlaceholder} />
          {search && <button className="icon-btn" onClick={() => setSearch("")}><X size={13} /></button>}
        </div>

        {importMsg && (
          <div className={"import-msg" + (importMsg.errors.length ? " import-msg-warn" : " import-msg-ok")}>
            <div className="import-msg-head">
              <span>{t.ipsImportedMsg(importMsg.count, importMsg.errors.length)}</span>
              <button className="icon-btn" onClick={() => setImportMsg(null)}><X size={13} /></button>
            </div>
            {importMsg.errors.length > 0 && (
              <ul className="import-msg-errors">
                {importMsg.errors.slice(0, 6).map((e, i) => <li key={i}>{e}</li>)}
                {importMsg.errors.length > 6 && <li>… {importMsg.errors.length - 6}</li>}
              </ul>
            )}
          </div>
        )}

        {search && library.filter(matchesSearch).length === 0 && (
          <div className="empty-note">{t.noIpMatchSearch(search)}</div>
        )}

        <div className="cat-sections">
          {CATS.map((cat) => {
            const items = library.filter((ip) => ip.category === cat && matchesSearch(ip));
            if (search && items.length === 0) return null;
            const isCollapsed = search ? false : !!collapsed[cat];
            const Icon = CATEGORY_META[cat].icon;
            return (
              <div className="cat-section" key={cat} style={{ "--cat-color": CATEGORY_META[cat].color }}>
                <div className="cat-section-head" onClick={() => toggleCollapsed(cat)}>
                  <ChevronDown size={14} className={"chev" + (isCollapsed ? " chev-collapsed" : "")} />
                  <Icon size={14} />
                  <span className="cat-section-title">{CATEGORY_META[cat].label}</span>
                  <span className="count-pill">{items.length}</span>
                  <span className="cat-section-spacer" />
                  <span className="cat-section-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="icon-btn" title={t.exportCatTip(CATEGORY_META[cat].label)} onClick={() => handleExportCategory(cat)}><Download size={13} /></button>
                    <button className="icon-btn" title={t.importCatTip(CATEGORY_META[cat].label)} onClick={() => handleImportClick(cat)}><Upload size={13} /></button>
                  </span>
                </div>
                {!isCollapsed && (
                  <div className="ip-list">
                    {items.length === 0 && <div className="empty-note">{t.noIpInCategory}</div>}
                    {items.map((ip) => {
                      const area = computeIpUnitArea(ip, tech);
                      return (
                        <div className="ip-row" key={ip.id}>
                          <CatBadge category={ip.category} />
                          <div className="ip-row-main">
                            <div className="ip-row-name">{ip.name}</div>
                            <div className="ip-row-sub">
                              {ip.mode === "fixed"
                                ? t.fixedAreaMode
                                : `${fmt0(ip.metricValue)} ${CATEGORY_META[ip.category].unit}`}
                              <span className="dot">·</span>{fmt(area, 4)} mm²
                            </div>
                            {ip.comment && <div className="ip-row-comment">{ip.comment}</div>}
                          </div>
                          <button className="icon-btn" onClick={() => startEdit(ip)}><Pencil size={14} /></button>
                          <button className="icon-btn icon-btn-danger" onClick={() => onDelete(ip.id)}><Trash2 size={14} /></button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {pendingImport && (
        <div className="modal-overlay" onClick={cancelPendingImport}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h4>{t.importModalTitle(pendingImport.fileName)}</h4>
            <p className="modal-text">
              {t.ipsFoundFor(pendingImport.ips.length, scopeLabel)}
              {pendingImport.errors.length > 0 && ` · ${t.ignoredLines(pendingImport.errors.length)}`}.
            </p>
            <p className="modal-text modal-text-dim">
              {t.addOrOverwriteIp(pendingImport.scope, scopeLabel)}
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={cancelPendingImport}>{t.cancel}</button>
              <button className="btn-ghost btn-ghost-danger" onClick={() => resolvePendingImport("overwrite")}>{t.overwrite}</button>
              <button className="btn-primary" onClick={() => resolvePendingImport("append")}>{t.add}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   TAB: TECHNOLOGY
============================================================================ */

function TechTab({ tech, onChange }) {
  const { lang } = useLang();
  const t = I18N[lang];
  const [importMsg, setImportMsg] = useState(null);
  const fileInputRef = useRef(null);

  const set = (k) => (e) => onChange({ ...tech, [k]: e.target.value });
  const applyPreset = (p) => onChange({
    ...tech, nodeName: p.name, digitalDensityGO1: p.digitalDensityGO1, digitalDensityGO2: p.digitalDensityGO2,
    sramBitCellArea: p.sramBitCellArea, nvmBitCellArea: p.nvmBitCellArea, ioPadPitch: p.ioPadPitch,
  });

  const handleExport = () => {
    const fname = `technologie-${String(tech.nodeName || "noeud").replace(/\s+/g, "")}.csv`;
    downloadTextFile(fname, techToCSV(tech), "text/csv;charset=utf-8;");
  };
  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { patch, errors, found } = parseTechCSV(String(ev.target.result || ""), lang);
      if (found > 0) onChange({ ...tech, ...patch });
      setImportMsg({ count: found, errors });
    };
    reader.onerror = () => setImportMsg({ count: 0, errors: [t.cantReadFile] });
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  return (
    <div className="grid-2">
      <div className="panel">
        <div className="panel-head">
          <h3>{t.techNode}</h3>
          <div className="head-actions">
            <button className="btn-ghost" onClick={handleExport} title={t.exportTechTip}>
              <Download size={13} /> {t.exportBtn}
            </button>
            <button className="btn-ghost" onClick={handleImportClick} title={t.importTechTip}>
              <Upload size={13} /> {t.importBtn}
            </button>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={handleFileChange} />
          </div>
        </div>
        {importMsg && (
          <div className={"import-msg" + (importMsg.errors.length ? " import-msg-warn" : " import-msg-ok")}>
            <div className="import-msg-head">
              <span>{t.paramsImportedMsg(importMsg.count, importMsg.errors.length)}</span>
              <button className="icon-btn" onClick={() => setImportMsg(null)}><X size={13} /></button>
            </div>
            {importMsg.errors.length > 0 && (
              <ul className="import-msg-errors">
                {importMsg.errors.slice(0, 6).map((e, i) => <li key={i}>{e}</li>)}
                {importMsg.errors.length > 6 && <li>… {importMsg.errors.length - 6}</li>}
              </ul>
            )}
          </div>
        )}
        <div className="preset-row">
          {NODE_PRESETS.map((p) => (
            <button key={p.name} className={"preset-btn" + (tech.nodeName === p.name ? " preset-active" : "")}
              onClick={() => applyPreset(p)}>{p.name}</button>
          ))}
        </div>
        <div className="note-box">
          <AlertTriangle size={14} />
          <span>{t.pdkNote}</span>
        </div>

        <div className="form-stack" style={{ marginTop: 14 }}>
          <Field label={t.fieldNodeName}>
            <input className="input" value={tech.nodeName} onChange={set("nodeName")} />
          </Field>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>{t.techDensityTitle}</h3></div>
        <div className="form-grid">
          <Field label={t.fieldDensityGO1} unit="kGates/mm²">
            <NumInput value={tech.digitalDensityGO1} min={1} step="any" onChange={set("digitalDensityGO1")} />
          </Field>
          <Field label={t.fieldDensityGO2} unit="kGates/mm²">
            <NumInput value={tech.digitalDensityGO2} min={1} step="any" onChange={set("digitalDensityGO2")} />
          </Field>
          <Field label={t.fieldUtilization} unit="%">
            <NumInput value={tech.areaUtilization} min={1} max={100} step="any" onChange={set("areaUtilization")} />
          </Field>
          <Field label={t.fieldSramBitcell} unit="µm²/bit">
            <NumInput value={tech.sramBitCellArea} min={0} step="any" onChange={set("sramBitCellArea")} />
          </Field>
          <Field label={t.fieldSramOverhead} unit="%">
            <NumInput value={tech.sramOverheadPct} min={0} step="any" onChange={set("sramOverheadPct")} />
          </Field>
          <Field label={t.fieldNvmBitcell} unit="µm²/bit">
            <NumInput value={tech.nvmBitCellArea} min={0} step="any" onChange={set("nvmBitCellArea")} />
          </Field>
          <Field label={t.fieldNvmOverhead} unit="%">
            <NumInput value={tech.nvmOverheadPct} min={0} step="any" onChange={set("nvmOverheadPct")} />
          </Field>
          <Field label={t.fieldAnalogOverhead} unit="%">
            <NumInput value={tech.analogOverheadPct} min={0} step="any" onChange={set("analogOverheadPct")} />
          </Field>
          <Field label={t.fieldIoPitch} unit="µm">
            <NumInput value={tech.ioPadPitch} min={1} step="any" onChange={set("ioPadPitch")} />
          </Field>
          <Field label={t.fieldSealRing} unit="µm">
            <NumInput value={tech.sealRingWidth} min={0} step="any" onChange={set("sealRingWidth")} />
          </Field>
          <Field label={t.fieldSawLane} unit="µm">
            <NumInput value={tech.sawLaneWidth} min={0} step="any" onChange={set("sawLaneWidth")} />
          </Field>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   TAB: SCENARIOS (BOM builder)
============================================================================ */

function ScenarioTab({ scenarios, activeId, library, tech, onSelect, onAdd, onDuplicate, onDelete, onRename, onSetField, onSetQty, onSetItemComment, onImportScenarios, onSaveToLibrary }) {
  const { lang } = useLang();
  const t = I18N[lang];
  const scenario = scenarios.find((s) => s.id === activeId) || scenarios[0];
  const [catFilter, setCatFilter] = useState("Toutes");
  const [search, setSearch] = useState("");
  const [importMsg, setImportMsg] = useState(null);
  const [pendingImport, setPendingImport] = useState(null); // { scenarios, errors, fileName }
  const [commentEditor, setCommentEditor] = useState(null); // { ipId, ipName, comment }
  const fileInputRef = useRef(null);
  const result = useMemo(() => computeScenario(scenario, library, tech), [scenario, library, tech]);

  const filteredLib = library
    .filter((i) => catFilter === "Toutes" || i.category === catFilter)
    .filter((i) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return i.name.toLowerCase().includes(q) || (i.comment || "").toLowerCase().includes(q);
    });

  const handleExportAll = () => {
    downloadTextFile("scenarios-bom.csv", scenariosToCSV(scenarios, library), "text/csv;charset=utf-8;");
  };
  const handleExportOne = (sc) => {
    downloadTextFile(`scenario-${sc.name.replace(/\s+/g, "_")}.csv`, scenariosToCSV([sc], library), "text/csv;charset=utf-8;");
  };
  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { scenarios: parsed, errors } = parseScenariosCSV(String(ev.target.result || ""), library, lang);
      if (parsed.length === 0) {
        setImportMsg({ count: 0, errors: errors.length ? errors : [t.noValidScenarioFound] });
        return;
      }
      setPendingImport({ scenarios: parsed, errors, fileName: file.name });
    };
    reader.onerror = () => setImportMsg({ count: 0, errors: [t.cantReadFile] });
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };
  const resolvePendingImport = (mode) => {
    if (!pendingImport) return;
    onImportScenarios(pendingImport.scenarios, mode);
    setImportMsg({ count: pendingImport.scenarios.length, errors: pendingImport.errors });
    setPendingImport(null);
  };
  const cancelPendingImport = () => setPendingImport(null);

  return (
    <div>
      <div className="panel-head" style={{ marginBottom: 12 }}>
        <h3>{t.scenariosTitle} <span className="count-pill">{scenarios.length}</span></h3>
        <div className="head-actions">
          <button className="btn-ghost" onClick={handleExportAll} title={t.exportAllScenariosTip}>
            <Download size={13} /> {t.exportAll}
          </button>
          <button className="btn-ghost" onClick={handleImportClick} title={t.importScenariosTip}>
            <Upload size={13} /> {t.importBtn}
          </button>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={handleFileChange} />
        </div>
      </div>

      {importMsg && (
        <div className={"import-msg" + (importMsg.errors.length ? " import-msg-warn" : " import-msg-ok")}>
          <div className="import-msg-head">
            <span>{t.scenariosImportedMsg(importMsg.count, importMsg.errors.length)}</span>
            <button className="icon-btn" onClick={() => setImportMsg(null)}><X size={13} /></button>
          </div>
          {importMsg.errors.length > 0 && (
            <ul className="import-msg-errors">
              {importMsg.errors.slice(0, 6).map((e, i) => <li key={i}>{e}</li>)}
              {importMsg.errors.length > 6 && <li>… {importMsg.errors.length - 6}</li>}
            </ul>
          )}
        </div>
      )}

      <div className="scenario-strip">
        {scenarios.map((s) => (
          <button key={s.id} className={"scenario-chip" + (s.id === activeId ? " scenario-chip-active" : "")}
            onClick={() => onSelect(s.id)}>
            {s.name}
          </button>
        ))}
        <button className="scenario-chip scenario-chip-add" onClick={onAdd}><Plus size={13} /> {t.newBtn}</button>
      </div>

      {scenario && (
        <div className="grid-3">
          <div className="panel">
            <div className="panel-head">
              <input className="input title-input" value={scenario.name} onChange={(e) => onRename(scenario.id, e.target.value)} />
            </div>
            <div className="scenario-actions">
              <button className="btn-ghost" onClick={() => onDuplicate(scenario.id)}><Copy size={13} /> {t.duplicate}</button>
              <button className="btn-ghost" onClick={() => handleExportOne(scenario)}><Download size={13} /> {t.exportBtn}</button>
              <button className="btn-ghost" onClick={() => onSaveToLibrary(scenario)} title={t.saveAsTemplateTip}>
                <Save size={13} /> {t.saveAsTemplate}
              </button>
              <button className="btn-ghost btn-ghost-danger" onClick={() => onDelete(scenario.id)} disabled={scenarios.length <= 1}>
                <Trash2 size={13} /> {t.deleteBtn}
              </button>
            </div>
            <div className="form-stack" style={{ marginTop: 12 }}>
              <Field label={t.fieldIoCount}>
                <NumInput value={scenario.ioCount} min={0} step={1}
                  onChange={(e) => onSetField(scenario.id, "ioCount", e.target.value)} />
              </Field>
              <div className="preview-line">
                <Info size={13} />
                <span>
                  {t.globalSealSawNote(`${fmt(result.diePitch, 3)} × ${fmt(result.diePitch, 3)} mm`)}
                </span>
              </div>
            </div>

            <div className="panel-head" style={{ marginTop: 18 }}>
              <h3>{t.bomContent}</h3>
              <div className="head-actions">
                <select className="input select-sm" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                  <option value="Toutes">{t.all}</option>
                  {CATS.map((c) => <option key={c} value={c}>{CATEGORY_META[c].label}</option>)}
                </select>
              </div>
            </div>
            <div className="search-box">
              <Search size={14} className="search-icon" />
              <input className="input search-input" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchIpPlaceholder} />
              {search && <button className="icon-btn" onClick={() => setSearch("")}><X size={13} /></button>}
            </div>
            {filteredLib.length === 0 && <div className="empty-note">{t.noIpMatchFilters}</div>}
            <div className="bom-list">
              {filteredLib.map((ip) => {
                const item = scenario.items.find((i) => i.ipId === ip.id) || { qty: 0 };
                const unitArea = computeIpUnitArea(ip, tech);
                return (
                  <div className="bom-row" key={ip.id}>
                    <CatBadge category={ip.category} />
                    <div className="ip-row-main">
                      <div className="ip-row-name" title={ip.comment || undefined}>{ip.name}</div>
                      <div className="ip-row-sub">{fmt(unitArea, 4)} mm² {t.unitPerUnit}</div>
                      {item.comment && <div className="ip-row-comment">{item.comment}</div>}
                    </div>
                    <button className={"icon-btn" + (item.comment ? " icon-btn-comment-active" : "")}
                      title={item.comment ? t.modifyComment : t.addComment}
                      onClick={() => setCommentEditor({ ipId: ip.id, ipName: ip.name, comment: item.comment || "" })}>
                      <MessageSquare size={14} />
                    </button>
                    <input type="number" className="input qty-input" min={0} step={1}
                      value={item.qty} onChange={(e) => onSetQty(scenario.id, ip.id, e.target.value)} />
                    <span className="bom-total">{fmt((Number(item.qty) || 0) * unitArea, 3)} mm²</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><h3>{t.summary}</h3></div>
            <SummaryStats result={result} tech={tech} />
          </div>

          <div className="panel">
            <div className="panel-head"><h3>{t.categoryBreakdown}</h3></div>
            <CategoryBarChart result={result} />
          </div>
        </div>
      )}

      {pendingImport && (
        <div className="modal-overlay" onClick={cancelPendingImport}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h4>{t.importModalTitle(pendingImport.fileName)}</h4>
            <p className="modal-text">
              {t.scenariosFoundCount(pendingImport.scenarios.length)}
              {pendingImport.errors.length > 0 && ` · ${t.ignoredLines(pendingImport.errors.length)}`}.
            </p>
            <p className="modal-text modal-text-dim">
              {t.addOrOverwriteScenarios(pendingImport.scenarios.length)}
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={cancelPendingImport}>{t.cancel}</button>
              <button className="btn-ghost btn-ghost-danger" onClick={() => resolvePendingImport("overwrite")}>{t.overwrite}</button>
              <button className="btn-primary" onClick={() => resolvePendingImport("append")}>{t.add}</button>
            </div>
          </div>
        </div>
      )}

      {commentEditor && scenario && (
        <BomCommentModal
          ipName={commentEditor.ipName}
          initialComment={commentEditor.comment}
          onSave={(text) => { onSetItemComment(scenario.id, commentEditor.ipId, text); setCommentEditor(null); }}
          onDelete={() => { onSetItemComment(scenario.id, commentEditor.ipId, ""); setCommentEditor(null); }}
          onClose={() => setCommentEditor(null)}
        />
      )}
    </div>
  );
}

function SummaryStats({ result, tech }) {
  const { lang } = useLang();
  const t = I18N[lang];
  return (
    <div className="stats-stack">
      <div className="stat-big">
        <div className="stat-big-label">{t.dieSizeWithSeal}</div>
        <div className="stat-big-value">{fmt(result.finalSide, 2)} × {fmt(result.finalSide, 2)} mm</div>
        <div className="stat-big-sub">{fmt(result.finalArea, 3)} mm²</div>
      </div>
      <div className="stat-line"><span>{t.coreAreaIps}</span><strong>{fmt(result.coreArea, 3)} mm²</strong></div>
      <div className="stat-line"><span>{t.floorplanOverhead(100 - Math.round(result.utilization * 100))}</span><strong>{fmt(result.overheadArea, 3)} mm²</strong></div>
      <div className="stat-line"><span>{t.ioLimitedArea(result.ioCount)}</span><strong>{fmt(result.ioExtraArea, 3)} mm²</strong></div>
      <div className={"limiter-badge " + (result.ioLimited ? "limiter-io" : "limiter-core")}>
        {result.ioLimited ? t.ioLimitedBadge : t.coreLimitedBadge}
      </div>
      <div className="stat-divider" />
      <div className="stat-line"><span>{t.sideBeforeSeal}</span><strong>{fmt(result.baseSide, 3)} mm</strong></div>
      <div className="stat-line"><span>{t.sealRingLabel(fmt(result.sealRingWidthMm * 1000, 0))}</span><strong>+{fmt(result.sealRingArea, 3)} mm²</strong></div>
      <div className="stat-line"><span>{t.sawLaneLabel}</span><strong>{fmt(result.sawLaneWidthMm * 1000, 0)} µm</strong></div>
      <div className="stat-line"><span>{t.diePitchLabel}</span><strong>{fmt(result.diePitch, 3)} mm</strong></div>
      <div className="stat-divider" />
      {CATS.map((c) => {
        const val = result.byCategory[c] || 0;
        const pct = result.finalArea > 0 ? (val / result.finalArea) * 100 : 0;
        return (
          <div className="stat-line" key={c}>
            <span><CatBadge category={c} /> {CATEGORY_META[c].label}</span>
            <strong>{fmt(val, 3)} mm² <span className="stat-pct">({fmt(pct, 1)}%)</span></strong>
          </div>
        );
      })}
    </div>
  );
}

function CategoryBarChart({ result }) {
  const data = CATS.map((c) => ({ name: CATEGORY_META[c].short, value: result.byCategory[c] || 0, color: CATEGORY_META[c].color }))
    .concat([
      { name: "OVH", value: result.overheadArea, color: OVERHEAD_COLOR },
      { name: "IO", value: result.ioExtraArea, color: IO_COLOR },
      { name: "SEAL", value: result.sealRingArea, color: SEALRING_COLOR },
    ]);
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#1E2530" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#8B96A5", fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }} axisLine={{ stroke: "#232A36" }} tickLine={false} />
          <YAxis tick={{ fill: "#8B96A5", fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }} axisLine={{ stroke: "#232A36" }} tickLine={false} width={54} />
          <Tooltip
            contentStyle={{ background: "#161B24", border: "1px solid #232A36", borderRadius: 6, fontFamily: "IBM Plex Mono, monospace", fontSize: 12 }}
            labelStyle={{ color: "#E7ECF2" }}
            formatter={(v) => [`${fmt(v, 3)} mm²`, "surface"]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ============================================================================
   TAB: FLOORPLAN
============================================================================ */

function FloorplanTab({ scenario, library, tech }) {
  const { lang } = useLang();
  const t = I18N[lang];
  const result = useMemo(() => computeScenario(scenario, library, tech), [scenario, library, tech]);
  const VIEW = 460;
  const pad = 40; // view margin in px
  const scale = (VIEW - 2 * pad) / result.finalSide;
  const coreSidePx = result.coreSide * scale;

  const treemapItems = result.rows.map((r) => ({
    id: r.ip.id + Math.random(),
    label: r.ip.name,
    sub: `${fmt(r.totalArea, 3)} mm²`,
    value: r.totalArea,
    color: CATEGORY_META[r.ip.category].color,
  }));
  const rects = squarify(treemapItems, 0, 0, coreSidePx, coreSidePx);

  const nPadsRaw = result.ioCount;
  const nPadsDrawn = Math.min(nPadsRaw, 96);
  const padsPerSide = Math.max(Math.round(nPadsDrawn / 4), 0);

  const dieSidePx = result.finalSide * scale; // outer edge, includes seal ring
  const dieOrigin = (VIEW - dieSidePx) / 2;
  const baseSidePx = result.baseSide * scale; // pad-ring / content boundary, inside the seal ring
  const baseOrigin = innerOriginAdj(dieOrigin, dieSidePx, baseSidePx);
  const coreOrigin = innerOriginAdj(baseOrigin, baseSidePx, coreSidePx);

  return (
    <div className="grid-floorplan">
      <div className="panel floorplan-panel">
        <div className="panel-head">
          <h3>{t.chipViewTitle(scenario?.name)}</h3>
          <span className="count-pill">{fmt(result.finalSide, 2)} × {fmt(result.finalSide, 2)} mm</span>
        </div>
        <div className="floorplan-canvas-wrap">
          <svg viewBox={`-34 -34 ${VIEW + 40} ${VIEW + 40}`} width="100%" height="480" className="floorplan-svg">
            {/* outer die + seal ring band */}
            <rect x={dieOrigin} y={dieOrigin} width={dieSidePx} height={dieSidePx}
              fill={SEALRING_COLOR} stroke={IO_COLOR} strokeWidth="1.5" strokeDasharray="2 3" />
            {/* content area inside the seal ring */}
            <rect x={baseOrigin} y={baseOrigin} width={baseSidePx} height={baseSidePx} fill="#0A0D12" />
            {/* IO pads straddling the seal-ring / content boundary */}
            {nPadsRaw > 0 && renderPads(baseOrigin, baseSidePx, padsPerSide)}
            {/* utilization / core square */}
            <rect x={coreOrigin} y={coreOrigin} width={coreSidePx} height={coreSidePx} fill={OVERHEAD_COLOR} />
            {/* treemap */}
            <g transform={`translate(${coreOrigin}, ${coreOrigin})`}>
              {rects.map((r, i) => (
                <g key={i}>
                  <rect x={r.x + 1} y={r.y + 1} width={Math.max(r.w - 2, 0)} height={Math.max(r.h - 2, 0)}
                    fill={r.color} opacity="0.88" stroke="#0A0D12" strokeWidth="1" rx="2" />
                  {r.w > 46 && r.h > 22 && (
                    <foreignObject x={r.x + 3} y={r.y + 2} width={Math.max(r.w - 6, 0)} height={Math.max(r.h - 4, 0)}>
                      <div className="treemap-label">
                        <div className="treemap-label-name">{r.label}</div>
                        {r.h > 34 && <div className="treemap-label-sub">{r.sub}</div>}
                      </div>
                    </foreignObject>
                  )}
                </g>
              ))}
            </g>
            {/* ruler labels */}
            <text x={dieOrigin} y={dieOrigin - 10} fill="#5B6572" fontSize="10" fontFamily="IBM Plex Mono, monospace">0</text>
            <text x={dieOrigin + dieSidePx} y={dieOrigin - 10} fill="#5B6572" fontSize="10" fontFamily="IBM Plex Mono, monospace" textAnchor="end">{fmt(result.finalSide, 2)} mm</text>
          </svg>
        </div>
        <div className="legend-row">
          {CATS.map((c) => (
            <span className="legend-item" key={c}><i style={{ background: CATEGORY_META[c].color }} /> {CATEGORY_META[c].label}</span>
          ))}
          <span className="legend-item"><i style={{ background: OVERHEAD_COLOR, border: "1px solid #333" }} /> {t.overheadFloorplan}</span>
          <span className="legend-item"><i style={{ background: IO_COLOR }} /> {t.padRing(nPadsRaw)}</span>
          <span className="legend-item"><i style={{ background: SEALRING_COLOR }} /> {t.sealRingParen(fmt(result.sealRingWidthMm * 1000, 0))}</span>
        </div>
        <div className="pitch-note">
          <Info size={13} />
          <span>{t.waferPitchNote(fmt(result.sawLaneWidthMm * 1000, 0), `${fmt(result.diePitch, 3)} × ${fmt(result.diePitch, 3)} mm`)}</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>{t.topContributors}</h3></div>
        <div className="contrib-list">
          {result.rows.length === 0 && <div className="empty-note">{t.noContentInScenario}</div>}
          {result.rows.map((r, i) => {
            const pct = result.finalArea > 0 ? (r.totalArea / result.finalArea) * 100 : 0;
            return (
              <div className="contrib-row" key={i}>
                <span className="contrib-rank">{i + 1}</span>
                <div className="contrib-main">
                  <div className="contrib-name"><CatBadge category={r.ip.category} /> {r.ip.name} {r.qty > 1 && <span className="dot">× {r.qty}</span>}</div>
                  <div className="contrib-bar-track"><div className="contrib-bar-fill" style={{ width: `${pct}%`, background: CATEGORY_META[r.ip.category].color }} /></div>
                </div>
                <div className="contrib-val">{fmt(r.totalArea, 3)}<span className="contrib-unit">mm²</span></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function innerOriginAdj(dieOrigin, dieSidePx, coreSidePx) {
  return dieOrigin + (dieSidePx - coreSidePx) / 2;
}

function renderPads(origin, side, perSide) {
  if (perSide <= 0) return null;
  const pads = [];
  const padW = 5, padH = 11;
  for (let i = 0; i < perSide; i++) {
    const t = (i + 0.5) / perSide;
    const c = origin + t * side - padW / 2;
    // top: straddles the top edge
    pads.push(<rect key={`t${i}`} x={c} y={origin - padH / 2} width={padW} height={padH} fill={IO_COLOR} rx="1" />);
    // bottom: straddles the bottom edge
    pads.push(<rect key={`b${i}`} x={c} y={origin + side - padH / 2} width={padW} height={padH} fill={IO_COLOR} rx="1" />);
    // left: straddles the left edge
    pads.push(<rect key={`l${i}`} x={origin - padH / 2} y={c} width={padH} height={padW} fill={IO_COLOR} rx="1" />);
    // right: straddles the right edge
    pads.push(<rect key={`r${i}`} x={origin + side - padH / 2} y={c} width={padH} height={padW} fill={IO_COLOR} rx="1" />);
  }
  return <g opacity="0.85">{pads}</g>;
}

function niceStep(rough) {
  if (rough <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const n = rough / pow;
  let step;
  if (n < 1.5) step = 1; else if (n < 3.5) step = 2; else if (n < 7.5) step = 5; else step = 10;
  return step * pow;
}

/* ============================================================================
   TAB: COMPARE SCENARIOS
============================================================================ */

function CompareTab({ scenarios, library, tech }) {
  const { lang } = useLang();
  const t = I18N[lang];
  const [selected, setSelected] = useState(() => scenarios.slice(0, Math.min(4, scenarios.length)).map((s) => s.id));

  useEffect(() => {
    setSelected((prev) => {
      const valid = prev.filter((id) => scenarios.some((s) => s.id === id));
      if (valid.length) return valid;
      return scenarios.slice(0, Math.min(4, scenarios.length)).map((s) => s.id);
    });
  }, [scenarios]);

  const toggle = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const compared = scenarios.filter((s) => selected.includes(s.id));
  const results = compared.map((s) => ({ scenario: s, result: computeScenario(s, library, tech) }));

  const maxSide = Math.max(1, ...results.map((r) => r.result.finalSide));
  const minArea = results.length ? Math.min(...results.map((r) => r.result.finalArea)) : 0;
  const SIL_MAX_PX = 150;

  const barData = results.map(({ scenario, result }) => {
    const row = { name: scenario.name };
    CATS.forEach((c) => (row[c] = result.byCategory[c] || 0));
    row["Overhead"] = result.overheadArea;
    row["IO"] = result.ioExtraArea;
    row["Seal ring"] = result.sealRingArea;
    return row;
  });

  const metricRows = [
    { label: t.dieSizeMetric, fmtFn: (r) => `${fmt(r.finalSide, 2)} × ${fmt(r.finalSide, 2)} mm`, best: "min", key: "finalSide" },
    { label: t.totalDieArea, fmtFn: (r) => `${fmt(r.finalArea, 3)} mm²`, best: "min", key: "finalArea" },
    { label: t.coreAreaMetric, fmtFn: (r) => `${fmt(r.coreArea, 3)} mm²`, key: "coreArea" },
    { label: t.overheadFloorplan, fmtFn: (r) => `${fmt(r.overheadArea, 3)} mm²`, key: "overheadArea" },
    { label: t.ioCountMetric, fmtFn: (r) => `${r.ioCount}`, key: "ioCount" },
    { label: t.ioLimitedAreaMetric, fmtFn: (r) => `${fmt(r.ioExtraArea, 3)} mm²`, key: "ioExtraArea" },
    { label: t.limiterMetric, fmtFn: (r) => (r.ioLimited ? t.ioLimitedShort : t.coreLimitedShort) },
    { label: t.sealRingAdded, fmtFn: (r) => `+${fmt(r.sealRingArea, 3)} mm²`, key: "sealRingArea" },
    { label: t.diePitchMetric, fmtFn: (r) => `${fmt(r.diePitch, 3)} mm`, key: "diePitch" },
    ...CATS.map((c) => ({ label: CATEGORY_META[c].label, fmtFn: (r) => `${fmt(r.byCategory[c] || 0, 3)} mm²`, key: `cat_${c}` })),
  ];

  const bestForKey = (key) => {
    if (!key) return null;
    const vals = results.map((r) => (key.startsWith("cat_") ? r.result.byCategory[key.slice(4)] || 0 : r.result[key]));
    return Math.min(...vals);
  };

  return (
    <div>
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head"><h3>{t.scenariosToCompare}</h3></div>
        <div className="compare-picker">
          {scenarios.map((s) => (
            <button key={s.id} className={"scenario-chip" + (selected.includes(s.id) ? " scenario-chip-active" : "")}
              onClick={() => toggle(s.id)}>
              {selected.includes(s.id) && <Check size={12} />} {s.name}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 && (
        <div className="panel"><div className="empty-note">{t.selectAtLeastOne}</div></div>
      )}

      {results.length > 0 && (
        <>
          <div className="grid-compare">
            <div className="panel">
              <div className="panel-head"><h3>{t.silhouettes}</h3></div>
              <div className="silhouette-row">
                {results.map(({ scenario, result }) => {
                  const px = Math.max(24, (result.finalSide / maxSide) * SIL_MAX_PX);
                  const isBest = result.finalArea === minArea;
                  return (
                    <div className="silhouette-item" key={scenario.id}>
                      <div className={"silhouette-box" + (isBest ? " silhouette-best" : "")} style={{ width: px, height: px }} />
                      <div className="silhouette-name">{scenario.name}</div>
                      <div className="silhouette-dim">{fmt(result.finalSide, 2)} mm</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head"><h3>{t.areaByCategory}</h3></div>
              <CompareBarChart data={barData} />
            </div>
          </div>

          <div className="panel" style={{ marginTop: 18 }}>
            <div className="panel-head"><h3>{t.comparisonTable}</h3></div>
            <div className="compare-table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>{t.metric}</th>
                    {results.map(({ scenario }) => <th key={scenario.id}>{scenario.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {metricRows.map((row, i) => {
                    const best = row.best === "min" ? bestForKey(row.key) : null;
                    return (
                      <tr key={i}>
                        <td className="compare-row-label">{row.label}</td>
                        {results.map(({ scenario, result }) => {
                          const val = row.key ? (row.key.startsWith("cat_") ? result.byCategory[row.key.slice(4)] || 0 : result[row.key]) : null;
                          const isBest = best !== null && val === best;
                          return (
                            <td key={scenario.id} className={isBest ? "compare-cell-best" : ""}>{row.fmtFn(result)}</td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CompareBarChart({ data }) {
  const keys = [...CATS, "Overhead", "IO", "Seal ring"];
  const colors = {
    ...Object.fromEntries(CATS.map((c) => [c, CATEGORY_META[c].color])),
    Overhead: OVERHEAD_COLOR, IO: IO_COLOR, "Seal ring": SEALRING_COLOR,
  };
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#1E2530" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#8B96A5", fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }} axisLine={{ stroke: "#232A36" }} tickLine={false} />
          <YAxis tick={{ fill: "#8B96A5", fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }} axisLine={{ stroke: "#232A36" }} tickLine={false} width={54} />
          <Tooltip
            contentStyle={{ background: "#161B24", border: "1px solid #232A36", borderRadius: 6, fontFamily: "IBM Plex Mono, monospace", fontSize: 12 }}
            labelStyle={{ color: "#E7ECF2" }}
            formatter={(v, name) => [`${fmt(v, 3)} mm²`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: "IBM Plex Mono, monospace", color: "#8B96A5" }} />
          {keys.map((k) => (
            <Bar key={k} dataKey={k} stackId="a" fill={colors[k]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ============================================================================
   TAB: MATRIX (all scenarios side by side, editable BOM)
============================================================================ */

function MatrixTab({ scenarios, library, tech, onSetQty, onSetField, onSetItemComment, onRename, onAdd, onDuplicate, onDelete }) {
  const { lang } = useLang();
  const t = I18N[lang];
  const results = useMemo(() => scenarios.map((sc) => computeScenario(sc, library, tech)), [scenarios, library, tech]);
  const [commentEditor, setCommentEditor] = useState(null); // { scId, ipId, ipName, comment }

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>{t.matrixScenarios} <span className="count-pill">{scenarios.length}</span></h3>
        <button className="btn-ghost" onClick={onAdd}><Plus size={13} /> {t.newScenario}</button>
      </div>
      <div className="matrix-wrap">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="matrix-corner">{t.ipVsScenario}</th>
              {scenarios.map((sc) => (
                <th key={sc.id} className="matrix-sc-head">
                  <div className="matrix-sc-head-row">
                    <input className="input matrix-name-input" value={sc.name}
                      onChange={(e) => onRename(sc.id, e.target.value)} />
                    <div className="matrix-sc-head-actions">
                      <button className="icon-btn" title={t.duplicate} onClick={() => onDuplicate(sc.id)}><Copy size={12} /></button>
                      <button className="icon-btn icon-btn-danger" title={t.deleteBtn} onClick={() => onDelete(sc.id)} disabled={scenarios.length <= 1}><Trash2 size={12} /></button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATS.map((cat) => {
              const catIps = library.filter((ip) => ip.category === cat);
              return (
                <React.Fragment key={cat}>
                  <tr className="matrix-cat-row" style={{ "--cat-color": CATEGORY_META[cat].color }}>
                    <td className="matrix-cat-label"><CatBadge category={cat} /> {CATEGORY_META[cat].label}</td>
                    {scenarios.map((sc) => <td key={sc.id} className="matrix-cat-fill" />)}
                  </tr>
                  {catIps.length === 0 && (
                    <tr>
                      <td className="matrix-ip-label matrix-empty">{t.noIp}</td>
                      {scenarios.map((sc) => <td key={sc.id} />)}
                    </tr>
                  )}
                  {catIps.map((ip) => {
                    const unitArea = computeIpUnitArea(ip, tech);
                    return (
                      <tr key={ip.id}>
                        <td className="matrix-ip-label" title={ip.comment || undefined}>
                          {ip.name}
                          <span className="matrix-ip-unit">{fmt(unitArea, 4)} {t.perUnit2}</span>
                        </td>
                        {scenarios.map((sc) => {
                          const item = sc.items.find((it) => it.ipId === ip.id) || { qty: 0 };
                          return (
                            <td key={sc.id} className="matrix-qty-cell">
                              <div className="matrix-qty-wrap">
                                <input type="number" className="input qty-input" min={0} step={1}
                                  value={item.qty} onChange={(e) => onSetQty(sc.id, ip.id, e.target.value)} />
                                <button className={"icon-btn matrix-comment-btn" + (item.comment ? " icon-btn-comment-active" : "")}
                                  title={item.comment ? item.comment : t.addComment}
                                  onClick={() => setCommentEditor({ scId: sc.id, ipId: ip.id, ipName: ip.name, comment: item.comment || "" })}>
                                  <MessageSquare size={11} />
                                </button>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}

            <tr className="matrix-cat-row matrix-cat-row-alt">
              <td className="matrix-cat-label"><Info size={12} /> {t.physicalParams}</td>
              {scenarios.map((sc) => <td key={sc.id} className="matrix-cat-fill" />)}
            </tr>
            <tr>
              <td className="matrix-ip-label">{t.fieldIoCount}</td>
              {scenarios.map((sc) => (
                <td key={sc.id} className="matrix-qty-cell">
                  <input type="number" className="input qty-input" min={0} step={1}
                    value={sc.ioCount} onChange={(e) => onSetField(sc.id, "ioCount", e.target.value)} />
                </td>
              ))}
            </tr>
          </tbody>
          <tfoot>
            <tr className="matrix-summary-row">
              <td className="matrix-ip-label">{t.dieSize}</td>
              {results.map((r, i) => (
                <td key={scenarios[i].id} className="matrix-summary-cell">{fmt(r.finalSide, 2)} × {fmt(r.finalSide, 2)} mm</td>
              ))}
            </tr>
            <tr className="matrix-summary-row">
              <td className="matrix-ip-label">{t.totalArea}</td>
              {results.map((r, i) => (
                <td key={scenarios[i].id} className="matrix-summary-cell matrix-summary-strong">{fmt(r.finalArea, 3)} mm²</td>
              ))}
            </tr>
            <tr className="matrix-summary-row">
              <td className="matrix-ip-label">{t.limiter}</td>
              {results.map((r, i) => (
                <td key={scenarios[i].id} className={"matrix-summary-cell " + (r.ioLimited ? "matrix-limiter-io" : "matrix-limiter-core")}>
                  {r.ioLimited ? t.ioLimitedShort : t.coreLimitedShort}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {commentEditor && (
        <BomCommentModal
          ipName={commentEditor.ipName}
          initialComment={commentEditor.comment}
          onSave={(text) => { onSetItemComment(commentEditor.scId, commentEditor.ipId, text); setCommentEditor(null); }}
          onDelete={() => { onSetItemComment(commentEditor.scId, commentEditor.ipId, ""); setCommentEditor(null); }}
          onClose={() => setCommentEditor(null)}
        />
      )}
    </div>
  );
}

/* ============================================================================
   TAB: SCENARIO LIBRARY (saved scenario templates, import/export)
============================================================================ */

function ScenarioLibraryTab({ scenarioLibrary, library, tech, onLoad, onDelete, onRename, onDuplicate, onImport }) {
  const { lang } = useLang();
  const t = I18N[lang];
  const [search, setSearch] = useState("");
  const [importMsg, setImportMsg] = useState(null);
  const [pendingImport, setPendingImport] = useState(null); // { scenarios, errors, fileName }
  const fileInputRef = useRef(null);

  const filtered = scenarioLibrary.filter((sc) => !search.trim() || sc.name.toLowerCase().includes(search.trim().toLowerCase()));

  const handleExportAll = () => {
    downloadTextFile("bibliotheque-scenarios.csv", scenariosToCSV(scenarioLibrary, library), "text/csv;charset=utf-8;");
  };
  const handleExportOne = (sc) => {
    downloadTextFile(`scenario-modele-${sc.name.replace(/\s+/g, "_")}.csv`, scenariosToCSV([sc], library), "text/csv;charset=utf-8;");
  };
  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { scenarios: parsed, errors } = parseScenariosCSV(String(ev.target.result || ""), library, lang);
      if (parsed.length === 0) {
        setImportMsg({ count: 0, errors: errors.length ? errors : [t.noValidScenarioFound] });
        return;
      }
      setPendingImport({ scenarios: parsed, errors, fileName: file.name });
    };
    reader.onerror = () => setImportMsg({ count: 0, errors: [t.cantReadFile] });
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };
  const resolvePendingImport = (mode) => {
    if (!pendingImport) return;
    onImport(pendingImport.scenarios, mode);
    setImportMsg({ count: pendingImport.scenarios.length, errors: pendingImport.errors });
    setPendingImport(null);
  };
  const cancelPendingImport = () => setPendingImport(null);

  return (
    <div>
      <div className="panel-head" style={{ marginBottom: 12 }}>
        <h3>{t.scenarioLibraryTitle} <span className="count-pill">{scenarioLibrary.length}</span></h3>
        <div className="head-actions">
          <button className="btn-ghost" onClick={handleExportAll} title={t.exportAllTemplatesTip}>
            <Download size={13} /> {t.exportAll}
          </button>
          <button className="btn-ghost" onClick={handleImportClick} title={t.importTemplatesTip}>
            <Upload size={13} /> {t.importBtn}
          </button>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={handleFileChange} />
        </div>
      </div>

      <div className="note-box">
        <Info size={14} />
        <span>{t.libraryNote}</span>
      </div>

      <div className="search-box">
        <Search size={14} className="search-icon" />
        <input className="input search-input" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={t.searchTemplatePlaceholder} />
        {search && <button className="icon-btn" onClick={() => setSearch("")}><X size={13} /></button>}
      </div>

      {importMsg && (
        <div className={"import-msg" + (importMsg.errors.length ? " import-msg-warn" : " import-msg-ok")}>
          <div className="import-msg-head">
            <span>{t.scenariosImportedMsg(importMsg.count, importMsg.errors.length)}</span>
            <button className="icon-btn" onClick={() => setImportMsg(null)}><X size={13} /></button>
          </div>
          {importMsg.errors.length > 0 && (
            <ul className="import-msg-errors">
              {importMsg.errors.slice(0, 6).map((e, i) => <li key={i}>{e}</li>)}
              {importMsg.errors.length > 6 && <li>… {importMsg.errors.length - 6}</li>}
            </ul>
          )}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="empty-note">{scenarioLibrary.length === 0 ? t.noTemplateYet : t.noTemplateMatch}</div>
      )}

      <div className="scenario-lib-list">
        {filtered.map((sc) => {
          const result = computeScenario(sc, library, tech);
          const nItems = sc.items.filter((it) => (Number(it.qty) || 0) > 0).length;
          return (
            <div className="scenario-lib-card" key={sc.id}>
              <div className="scenario-lib-main">
                <input className="input scenario-lib-name" value={sc.name} onChange={(e) => onRename(sc.id, e.target.value)} />
                <div className="scenario-lib-meta">
                  {t.templateMeta(nItems, sc.ioCount, `${fmt(result.finalSide, 2)} × ${fmt(result.finalSide, 2)} mm`)}
                </div>
              </div>
              <div className="scenario-lib-actions">
                <button className="btn-ghost" onClick={() => onLoad(sc.id)} title={t.loadTemplateTip}>
                  <FolderOpen size={13} /> {t.load}
                </button>
                <button className="icon-btn" title={t.duplicate} onClick={() => onDuplicate(sc.id)}><Copy size={14} /></button>
                <button className="icon-btn" title={t.exportBtn} onClick={() => handleExportOne(sc)}><Download size={14} /></button>
                <button className="icon-btn icon-btn-danger" title={t.deleteBtn} onClick={() => onDelete(sc.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {pendingImport && (
        <div className="modal-overlay" onClick={cancelPendingImport}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h4>{t.importModalTitle(pendingImport.fileName)}</h4>
            <p className="modal-text">
              {t.scenariosFoundCount(pendingImport.scenarios.length)}
              {pendingImport.errors.length > 0 && ` · ${t.ignoredLines(pendingImport.errors.length)}`}.
            </p>
            <p className="modal-text modal-text-dim">
              {t.addOrOverwriteTemplates(pendingImport.scenarios.length)}
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={cancelPendingImport}>{t.cancel}</button>
              <button className="btn-ghost btn-ghost-danger" onClick={() => resolvePendingImport("overwrite")}>{t.overwrite}</button>
              <button className="btn-primary" onClick={() => resolvePendingImport("append")}>{t.add}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   ROOT APP
============================================================================ */

const STORAGE_KEY = "soc-estimator-state-v1";
const getTabs = (t) => [
  { id: "library", label: t.tabLibrary, icon: Library },
  { id: "tech", label: t.tabTech, icon: Settings2 },
  { id: "scenario", label: t.tabScenario, icon: ListChecks },
  { id: "scenarioLibrary", label: t.tabScenarioLibrary, icon: BookMarked },
  { id: "matrix", label: t.tabMatrix, icon: Table2 },
  { id: "floorplan", label: t.tabFloorplan, icon: LayoutGrid },
  { id: "compare", label: t.tabCompare, icon: GitCompare },
];

export default function App() {
  const [state, setState] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("library");
  const loadedOnce = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (res && res.value) setState(migrateState(JSON.parse(res.value)));
        else setState(defaultState());
      } catch (e) {
        setState(defaultState());
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready || !state) return;
    const saveTimer = setTimeout(() => {
      window.storage.set(STORAGE_KEY, JSON.stringify(state), false).catch(() => {});
    }, 300);
    return () => clearTimeout(saveTimer);
  }, [state, ready]);

  if (!ready || !state) {
    return (
      <div className="app-loading">
        <style>{GLOBAL_CSS}</style>
        <div className="loading-text">Chargement de l'atelier de conception… / Loading design workbench…</div>
      </div>
    );
  }

  const lang = state.lang === "en" ? "en" : "fr";
  const t = I18N[lang];
  CATS.forEach((k) => {
    CATEGORY_META[k].label = CAT_LABELS[lang][k];
    CATEGORY_META[k].short = CAT_SHORT[lang][k];
    CATEGORY_META[k].unit = CAT_UNIT[lang][k];
  });
  const setLang = (l) => setState((s) => ({ ...s, lang: l }));

  const update = (fn) => setState((prev) => fn(prev));

  const addIp = (ip) => update((s) => ({
    ...s,
    library: [...s.library, ip],
    scenarios: s.scenarios.map((sc) => ({ ...sc, items: [...sc.items, { ipId: ip.id, qty: 0 }] })),
  }));
  const updateIp = (id, patch) => update((s) => ({ ...s, library: s.library.map((i) => (i.id === id ? { ...patch, id } : i)) }));
  const deleteIp = (id) => update((s) => ({
    ...s,
    library: s.library.filter((i) => i.id !== id),
    scenarios: s.scenarios.map((sc) => ({ ...sc, items: sc.items.filter((it) => it.ipId !== id) })),
  }));

  const importIps = (newIps, mode = "append", scope = "all") => update((s) => {
    let library;
    let removedIds = [];
    if (mode === "overwrite") {
      if (scope === "all") {
        removedIds = s.library.map((ip) => ip.id);
        library = newIps;
      } else {
        const toRemove = s.library.filter((ip) => ip.category === scope);
        removedIds = toRemove.map((ip) => ip.id);
        library = [...s.library.filter((ip) => ip.category !== scope), ...newIps];
      }
    } else {
      library = [...s.library, ...newIps];
    }
    const removedSet = new Set(removedIds);
    const scenarios = s.scenarios.map((sc) => {
      const kept = sc.items.filter((it) => !removedSet.has(it.ipId));
      const existingIds = new Set(kept.map((it) => it.ipId));
      const added = newIps.filter((ip) => !existingIds.has(ip.id)).map((ip) => ({ ipId: ip.id, qty: 0 }));
      return { ...sc, items: [...kept, ...added] };
    });
    return { ...s, library, scenarios };
  });

  const setTech = (tech) => update((s) => ({ ...s, tech }));

  const addScenario = () => update((s) => {
    const ns = { id: uid(), name: `Scénario ${s.scenarios.length + 1}`, ioCount: 100, items: s.library.map((ip) => ({ ipId: ip.id, qty: 0 })) };
    return { ...s, scenarios: [...s.scenarios, ns], activeScenarioId: ns.id };
  });
  const duplicateScenario = (id) => update((s) => {
    const orig = s.scenarios.find((sc) => sc.id === id);
    if (!orig) return s;
    const copy = { ...orig, id: uid(), name: orig.name + " (copie)" };
    return { ...s, scenarios: [...s.scenarios, copy], activeScenarioId: copy.id };
  });
  const deleteScenario = (id) => update((s) => {
    if (s.scenarios.length <= 1) return s;
    const remaining = s.scenarios.filter((sc) => sc.id !== id);
    return { ...s, scenarios: remaining, activeScenarioId: s.activeScenarioId === id ? remaining[0].id : s.activeScenarioId };
  });
  const renameScenario = (id, name) => update((s) => ({ ...s, scenarios: s.scenarios.map((sc) => (sc.id === id ? { ...sc, name } : sc)) }));
  const setScenarioField = (id, field, value) => update((s) => ({ ...s, scenarios: s.scenarios.map((sc) => (sc.id === id ? { ...sc, [field]: value } : sc)) }));
  const setQty = (scId, ipId, qty) => update((s) => ({
    ...s,
    scenarios: s.scenarios.map((sc) => {
      if (sc.id !== scId) return sc;
      const exists = sc.items.some((it) => it.ipId === ipId);
      const items = exists ? sc.items.map((it) => (it.ipId === ipId ? { ...it, qty } : it)) : [...sc.items, { ipId, qty }];
      return { ...sc, items };
    }),
  }));

  const setItemComment = (scId, ipId, comment) => update((s) => ({
    ...s,
    scenarios: s.scenarios.map((sc) => {
      if (sc.id !== scId) return sc;
      const exists = sc.items.some((it) => it.ipId === ipId);
      const items = exists
        ? sc.items.map((it) => (it.ipId === ipId ? { ...it, comment } : it))
        : [...sc.items, { ipId, qty: 0, comment }];
      return { ...sc, items };
    }),
  }));

  const importScenarios = (newScenarios, mode = "append") => update((s) => {
    if (mode === "overwrite") {
      return { ...s, scenarios: newScenarios, activeScenarioId: newScenarios[0]?.id || s.activeScenarioId };
    }
    const existingNames = new Set(s.scenarios.map((sc) => sc.name));
    const toAdd = newScenarios.map((sc) => {
      let name = sc.name;
      while (existingNames.has(name)) name = `${name} (import)`;
      existingNames.add(name);
      return { ...sc, name };
    });
    return { ...s, scenarios: [...s.scenarios, ...toAdd], activeScenarioId: toAdd[0]?.id || s.activeScenarioId };
  });

  const saveScenarioToLibrary = (scenario) => update((s) => {
    const existingNames = new Set((s.scenarioLibrary || []).map((sc) => sc.name));
    let name = scenario.name;
    while (existingNames.has(name)) name = `${name} (copie)`;
    const entry = { id: uid(), name, ioCount: scenario.ioCount, items: scenario.items.map((it) => ({ ...it })) };
    return { ...s, scenarioLibrary: [...(s.scenarioLibrary || []), entry] };
  });

  const loadLibraryScenarioIntoActive = (libId) => update((s) => {
    const entry = (s.scenarioLibrary || []).find((sc) => sc.id === libId);
    if (!entry) return s;
    const existingNames = new Set(s.scenarios.map((sc) => sc.name));
    let name = entry.name;
    while (existingNames.has(name)) name = `${name} (copie)`;
    const ns = { id: uid(), name, ioCount: entry.ioCount, items: entry.items.map((it) => ({ ...it })) };
    return { ...s, scenarios: [...s.scenarios, ns], activeScenarioId: ns.id };
  });

  const deleteLibraryScenario = (libId) => update((s) => ({
    ...s, scenarioLibrary: (s.scenarioLibrary || []).filter((sc) => sc.id !== libId),
  }));

  const renameLibraryScenario = (libId, name) => update((s) => ({
    ...s, scenarioLibrary: (s.scenarioLibrary || []).map((sc) => (sc.id === libId ? { ...sc, name } : sc)),
  }));

  const duplicateLibraryScenario = (libId) => update((s) => {
    const entry = (s.scenarioLibrary || []).find((sc) => sc.id === libId);
    if (!entry) return s;
    const copy = { ...entry, id: uid(), name: entry.name + " (copie)" };
    return { ...s, scenarioLibrary: [...s.scenarioLibrary, copy] };
  });

  const importScenarioLibrary = (newScenarios, mode = "append") => update((s) => {
    if (mode === "overwrite") return { ...s, scenarioLibrary: newScenarios };
    const existingNames = new Set((s.scenarioLibrary || []).map((sc) => sc.name));
    const toAdd = newScenarios.map((sc) => {
      let name = sc.name;
      while (existingNames.has(name)) name = `${name} (import)`;
      existingNames.add(name);
      return { ...sc, name };
    });
    return { ...s, scenarioLibrary: [...(s.scenarioLibrary || []), ...toAdd] };
  });

  const resetAll = () => {
    if (!window.confirm(t.resetConfirm)) return;
    setState(defaultState());
  };

  const activeScenario = state.scenarios.find((s) => s.id === state.activeScenarioId) || state.scenarios[0];
  const TABS = getTabs(t);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
    <div className="app">
      <style>{GLOBAL_CSS}</style>

      <header className="app-header">
        <div className="brand">
          <div className="brand-mark"><Layers size={20} strokeWidth={2.2} /></div>
          <div>
            <div className="brand-title">{t.appTitle}</div>
            <div className="brand-sub">{t.appSubtitle(state.tech.nodeName)}</div>
          </div>
        </div>
        <div className="header-right">
          <div className="lang-switch">
            <button className={"lang-flag" + (lang === "fr" ? " lang-flag-active" : "")} title="Français" onClick={() => setLang("fr")}>🇫🇷</button>
            <button className={"lang-flag" + (lang === "en" ? " lang-flag-active" : "")} title="English" onClick={() => setLang("en")}>🇬🇧</button>
          </div>
          {tab !== "scenario" && (
            <select className="input scenario-select" value={state.activeScenarioId}
              onChange={(e) => setState((s) => ({ ...s, activeScenarioId: e.target.value }))}>
              {state.scenarios.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
          <button className="btn-ghost" onClick={resetAll}><RotateCcw size={13} /> {t.reset}</button>
        </div>
      </header>

      <nav className="tab-bar">
        {TABS.map((tabDef) => {
          const Icon = tabDef.icon;
          return (
            <button key={tabDef.id} className={"tab-btn" + (tab === tabDef.id ? " tab-btn-active" : "")} onClick={() => setTab(tabDef.id)}>
              <Icon size={15} /> {tabDef.label}
            </button>
          );
        })}
      </nav>

      <main className="app-main">
        {tab === "library" && (
          <LibraryTab library={state.library} tech={state.tech} onAdd={addIp} onUpdate={updateIp} onDelete={deleteIp} onImport={importIps} />
        )}
        {tab === "tech" && <TechTab tech={state.tech} onChange={setTech} />}
        {tab === "scenario" && (
          <ScenarioTab
            scenarios={state.scenarios} activeId={state.activeScenarioId} library={state.library} tech={state.tech}
            onSelect={(id) => setState((s) => ({ ...s, activeScenarioId: id }))}
            onAdd={addScenario} onDuplicate={duplicateScenario} onDelete={deleteScenario}
            onRename={renameScenario} onSetField={setScenarioField} onSetQty={setQty} onSetItemComment={setItemComment} onImportScenarios={importScenarios}
            onSaveToLibrary={saveScenarioToLibrary}
          />
        )}
        {tab === "scenarioLibrary" && (
          <ScenarioLibraryTab
            scenarioLibrary={state.scenarioLibrary || []} library={state.library} tech={state.tech}
            onLoad={loadLibraryScenarioIntoActive} onDelete={deleteLibraryScenario}
            onRename={renameLibraryScenario} onDuplicate={duplicateLibraryScenario}
            onImport={importScenarioLibrary}
          />
        )}
        {tab === "matrix" && (
          <MatrixTab
            scenarios={state.scenarios} library={state.library} tech={state.tech}
            onSetQty={setQty} onSetField={setScenarioField} onSetItemComment={setItemComment} onRename={renameScenario}
            onAdd={addScenario} onDuplicate={duplicateScenario} onDelete={deleteScenario}
          />
        )}
        {tab === "floorplan" && (
          <FloorplanTab scenario={activeScenario} library={state.library} tech={state.tech} />
        )}
        {tab === "compare" && (
          <CompareTab scenarios={state.scenarios} library={state.library} tech={state.tech} />
        )}
      </main>
    </div>
    </LangContext.Provider>
  );
}

/* ============================================================================
   CSS
============================================================================ */

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

:root {
  --bg: #0A0D12;
  --panel: #10141B;
  --panel-2: #161B24;
  --border: #232A36;
  --text: #E7ECF2;
  --text-dim: #8B96A5;
  --text-faint: #5B6572;
  --accent: #45D9C6;
}

.app, .app-loading { background: var(--bg); color: var(--text); font-family: 'IBM Plex Sans', sans-serif; min-height: 100vh; box-sizing: border-box; }
.app-loading { display: flex; align-items: center; justify-content: center; }
.loading-text { color: var(--text-dim); font-family: 'IBM Plex Mono', monospace; font-size: 13px; letter-spacing: 0.04em; }
* { box-sizing: border-box; }

.app-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 22px; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 10px; }
.brand { display: flex; align-items: center; gap: 12px; }
.brand-mark { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(145deg, #16202A, #0D1319); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--accent); }
.brand-title { font-family: 'IBM Plex Mono', monospace; font-weight: 700; font-size: 17px; letter-spacing: 0.02em; }
.brand-sub { font-size: 11.5px; color: var(--text-dim); font-family: 'IBM Plex Mono', monospace; }
.header-right { display: flex; align-items: center; gap: 10px; }
.scenario-select { min-width: 170px; }
.lang-switch { display: flex; gap: 2px; background: var(--panel-2); border: 1px solid var(--border); border-radius: 7px; padding: 3px; }
.lang-flag { background: transparent; border: none; font-size: 16px; line-height: 1; padding: 4px 7px; border-radius: 5px; cursor: pointer; opacity: 0.5; filter: grayscale(60%); transition: opacity .15s, filter .15s, background .15s; }
.lang-flag:hover { opacity: 0.85; }
.lang-flag-active { opacity: 1; filter: none; background: color-mix(in srgb, var(--accent) 16%, transparent); }

.tab-bar { display: flex; gap: 2px; padding: 0 22px; border-bottom: 1px solid var(--border); overflow-x: auto; }
.tab-btn { display: flex; align-items: center; gap: 7px; padding: 12px 16px; background: transparent; border: none; color: var(--text-dim); font-family: 'IBM Plex Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; transition: color .15s, border-color .15s; }
.tab-btn:hover { color: var(--text); }
.tab-btn-active { color: var(--accent); border-bottom-color: var(--accent); }

.app-main { padding: 22px; max-width: 1400px; margin: 0 auto; }

.grid-2 { display: grid; grid-template-columns: 1fr 1.3fr; gap: 18px; }
.grid-3 { display: grid; grid-template-columns: 1.3fr 0.85fr 0.95fr; gap: 18px; align-items: start; }
.grid-floorplan { display: grid; grid-template-columns: 1.5fr 1fr; gap: 18px; align-items: start; }
@media (max-width: 980px) { .grid-2, .grid-3, .grid-floorplan { grid-template-columns: 1fr; } }

.panel { background: var(--panel); border: 1px solid var(--border); border-radius: 10px; padding: 18px; }
.panel-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
.panel-head h3 { margin: 0; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; }

.form-stack { display: flex; flex-direction: column; gap: 12px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 14px; }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }

.field { display: flex; flex-direction: column; gap: 5px; }
.field-label { font-size: 11.5px; color: var(--text-dim); font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.01em; }
.field-unit { color: var(--text-faint); }

.input { background: var(--panel-2); border: 1px solid var(--border); color: var(--text); border-radius: 6px; padding: 8px 10px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; outline: none; width: 100%; }
.input:focus { border-color: var(--accent); }
.textarea { resize: vertical; font-family: 'IBM Plex Sans', sans-serif; line-height: 1.4; min-height: 40px; }
.select-sm { width: auto; padding: 5px 8px; font-size: 12px; }
.title-input { font-size: 14px; font-weight: 600; font-family: 'IBM Plex Sans', sans-serif; border-color: transparent; background: transparent; padding: 4px 0; }
.title-input:focus { border-color: var(--border); background: var(--panel-2); padding: 4px 8px; }

.segmented { display: flex; gap: 4px; background: var(--panel-2); border: 1px solid var(--border); border-radius: 7px; padding: 3px; }
.seg-btn { flex: 1; background: transparent; border: none; color: var(--text-dim); padding: 6px 8px; border-radius: 5px; font-size: 12px; font-family: 'IBM Plex Mono', monospace; cursor: pointer; }
.seg-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.seg-active { background: color-mix(in srgb, var(--seg-color) 20%, transparent); color: var(--seg-color, var(--accent)); font-weight: 600; }

.preview-line { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: var(--text-dim); background: var(--panel-2); padding: 9px 11px; border-radius: 6px; border: 1px dashed var(--border); }
.preview-line strong { color: var(--text); }

.btn-primary { display: flex; align-items: center; justify-content: center; gap: 7px; background: var(--accent); color: #06201C; border: none; padding: 10px 14px; border-radius: 7px; font-weight: 600; font-size: 13px; cursor: pointer; }
.btn-primary:hover { filter: brightness(1.08); }
.btn-ghost { display: flex; align-items: center; gap: 6px; background: var(--panel-2); border: 1px solid var(--border); color: var(--text-dim); padding: 7px 11px; border-radius: 7px; font-size: 12.5px; cursor: pointer; }
.btn-ghost:hover { color: var(--text); }
.btn-ghost-danger:hover { color: #F2688A; border-color: #F2688A55; }
.btn-ghost:disabled { opacity: 0.35; cursor: not-allowed; }

.icon-btn { background: transparent; border: 1px solid transparent; color: var(--text-faint); padding: 6px; border-radius: 6px; cursor: pointer; display: flex; }
.icon-btn:hover { background: var(--panel-2); color: var(--text); }
.icon-btn-danger:hover { color: #F2688A; }

.count-pill { background: var(--panel-2); border: 1px solid var(--border); font-family: 'IBM Plex Mono', monospace; font-size: 11px; padding: 2px 8px; border-radius: 20px; color: var(--text-dim); }

.badge { display: inline-flex; align-items: center; gap: 4px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.03em; padding: 3px 6px; border-radius: 5px; background: color-mix(in srgb, var(--badge-color) 16%, transparent); color: var(--badge-color); white-space: nowrap; }

.head-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.search-box { display: flex; align-items: center; gap: 8px; background: var(--panel-2); border: 1px solid var(--border); border-radius: 7px; padding: 7px 10px; margin-bottom: 12px; }
.search-icon { color: var(--text-faint); flex-shrink: 0; }
.search-input { background: transparent; border: none; padding: 0; font-family: 'IBM Plex Sans', sans-serif; }
.search-input:focus { border: none; }

.cat-sections { display: flex; flex-direction: column; gap: 10px; }
.cat-section { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
.cat-section-head { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: var(--panel-2); cursor: pointer; border-left: 3px solid var(--cat-color); color: var(--text); user-select: none; }
.cat-section-title { font-size: 13px; font-weight: 600; }
.cat-section-spacer { flex: 1; }
.cat-section-actions { display: flex; gap: 4px; }
.chev { color: var(--text-faint); transition: transform 0.15s; flex-shrink: 0; }
.chev-collapsed { transform: rotate(-90deg); }
.cat-section .ip-list { padding: 8px; max-height: none; }

.modal-overlay { position: fixed; inset: 0; background: rgba(6, 9, 13, 0.72); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px; }
.modal-box { background: var(--panel); border: 1px solid var(--border); border-radius: 10px; padding: 20px; max-width: 440px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
.modal-box h4 { margin: 0 0 10px; font-size: 15px; font-weight: 600; }
.modal-text { font-size: 13px; color: var(--text-dim); line-height: 1.5; margin: 0 0 10px; }
.modal-text strong { color: var(--text); }
.modal-text-dim { color: var(--text-faint); }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }

.import-msg { border: 1px solid var(--border); border-radius: 7px; padding: 9px 11px; margin-bottom: 10px; font-size: 12px; }
.import-msg-ok { background: color-mix(in srgb, var(--accent) 10%, transparent); border-color: color-mix(in srgb, var(--accent) 35%, transparent); }
.import-msg-warn { background: #201A0F; border-color: #4A3A1D; color: #E8B368; }
.import-msg-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.import-msg-errors { margin: 6px 0 0; padding-left: 18px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; opacity: 0.9; }
.import-msg-errors li { margin-bottom: 2px; }

.ip-list, .bom-list { display: flex; flex-direction: column; gap: 6px; max-height: 560px; overflow-y: auto; }
.ip-row, .bom-row { display: flex; align-items: center; gap: 10px; background: var(--panel-2); border: 1px solid var(--border); border-radius: 8px; padding: 9px 10px; }
.ip-row-main { flex: 1; min-width: 0; }
.ip-row-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ip-row-sub { font-size: 11px; color: var(--text-dim); font-family: 'IBM Plex Mono', monospace; }
.ip-row-comment { font-size: 11.5px; color: var(--text-faint); margin-top: 3px; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dot { margin: 0 5px; color: var(--text-faint); }
.empty-note { color: var(--text-faint); font-size: 12.5px; padding: 14px 4px; text-align: center; }

.qty-input { width: 62px; text-align: right; padding: 6px 8px; }
.bom-total { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: var(--text-dim); width: 88px; text-align: right; }

.preset-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.preset-btn { background: var(--panel-2); border: 1px solid var(--border); color: var(--text-dim); padding: 7px 12px; border-radius: 7px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; cursor: pointer; }
.preset-btn:hover { color: var(--text); }
.preset-active { border-color: var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); }

.note-box { display: flex; gap: 8px; align-items: flex-start; background: #201A0F; border: 1px solid #4A3A1D; color: #E8B368; padding: 10px 12px; border-radius: 7px; font-size: 12px; line-height: 1.5; }

.scenario-strip { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.scenario-chip { background: var(--panel); border: 1px solid var(--border); color: var(--text-dim); padding: 8px 14px; border-radius: 20px; font-size: 12.5px; cursor: pointer; font-family: 'IBM Plex Mono', monospace; }
.scenario-chip-active { border-color: var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent); }
.scenario-chip-add { display: flex; align-items: center; gap: 5px; border-style: dashed; }

.scenario-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.scenario-lib-list { display: flex; flex-direction: column; gap: 8px; }
.scenario-lib-card { display: flex; align-items: center; gap: 12px; background: var(--panel); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; flex-wrap: wrap; }
.scenario-lib-main { flex: 1; min-width: 200px; }
.scenario-lib-name { font-size: 13.5px; font-weight: 600; padding: 5px 8px; margin-bottom: 4px; }
.scenario-lib-meta { font-size: 11.5px; color: var(--text-dim); font-family: 'IBM Plex Mono', monospace; padding-left: 2px; }
.scenario-lib-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

.compare-picker { display: flex; flex-wrap: wrap; gap: 8px; }
.grid-compare { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 18px; align-items: start; }
@media (max-width: 980px) { .grid-compare { grid-template-columns: 1fr; } }

.silhouette-row { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 22px; padding: 10px 4px 4px; min-height: 190px; }
.silhouette-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.silhouette-box { border: 1.5px solid var(--border); background: var(--panel-2); border-radius: 4px; }
.silhouette-best { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); }
.silhouette-name { font-size: 11.5px; color: var(--text-dim); max-width: 110px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.silhouette-dim { font-size: 11px; color: var(--text-faint); font-family: 'IBM Plex Mono', monospace; }

.compare-table-wrap { overflow-x: auto; }
.compare-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.compare-table th, .compare-table td { padding: 8px 12px; text-align: right; border-bottom: 1px solid var(--border); white-space: nowrap; font-family: 'IBM Plex Mono', monospace; }
.compare-table th { color: var(--text-dim); font-weight: 600; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.03em; }
.compare-table th:first-child, .compare-table td:first-child { text-align: left; font-family: 'IBM Plex Sans', sans-serif; color: var(--text-dim); position: sticky; left: 0; background: var(--panel); }
.compare-cell-best { color: var(--accent); font-weight: 700; }

.matrix-wrap { overflow-x: auto; }
.matrix-table { border-collapse: collapse; width: 100%; font-size: 12.5px; }
.matrix-table th, .matrix-table td { padding: 7px 10px; border-bottom: 1px solid var(--border); white-space: nowrap; }
.matrix-corner { position: sticky; left: 0; background: var(--panel); z-index: 3; text-align: left; font-size: 11px; color: var(--text-faint); font-family: 'IBM Plex Mono', monospace; font-weight: 500; }
.matrix-sc-head { min-width: 180px; background: var(--panel-2); text-align: left; }
.matrix-sc-head-row { display: flex; align-items: center; gap: 6px; }
.matrix-name-input { font-size: 12.5px; padding: 5px 7px; font-family: 'IBM Plex Sans', sans-serif; }
.matrix-sc-head-actions { display: flex; gap: 2px; flex-shrink: 0; }
.matrix-cat-row td { background: var(--panel-2); font-weight: 600; font-size: 11.5px; color: var(--text-dim); border-left: 3px solid var(--cat-color); border-bottom: 1px solid var(--border); }
.matrix-cat-row .matrix-cat-label { display: flex; align-items: center; gap: 6px; position: sticky; left: 0; background: var(--panel-2); z-index: 2; }
.matrix-cat-row-alt td { border-left-color: var(--border); }
.matrix-ip-label { position: sticky; left: 0; background: var(--panel); z-index: 1; text-align: left; max-width: 240px; overflow: hidden; text-overflow: ellipsis; font-size: 12.5px; }
.matrix-ip-unit { display: block; font-size: 10px; color: var(--text-faint); font-family: 'IBM Plex Mono', monospace; font-weight: 400; }
.matrix-qty-cell { text-align: center; }
.matrix-qty-wrap { display: inline-flex; align-items: center; gap: 3px; }
.matrix-comment-btn { padding: 4px; flex-shrink: 0; }
.icon-btn-comment-active { color: var(--accent); }
.matrix-empty { color: var(--text-faint); font-style: italic; }
.matrix-summary-row td { border-top: 2px solid var(--border); border-bottom: none; font-family: 'IBM Plex Mono', monospace; }
.matrix-summary-cell { text-align: center; color: var(--text-dim); }
.matrix-summary-strong { color: var(--accent); font-weight: 700; }
.matrix-limiter-io { color: #B7C0CC; }
.matrix-limiter-core { color: var(--accent); }

.stats-stack { display: flex; flex-direction: column; gap: 10px; }
.stat-big { background: var(--panel-2); border: 1px solid var(--border); border-radius: 8px; padding: 14px; }
.stat-big-label { font-size: 11px; color: var(--text-dim); font-family: 'IBM Plex Mono', monospace; margin-bottom: 4px; }
.stat-big-value { font-size: 22px; font-weight: 700; font-family: 'IBM Plex Mono', monospace; color: var(--accent); }
.stat-big-sub { font-size: 12px; color: var(--text-dim); margin-top: 2px; }
.stat-line { display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; color: var(--text-dim); gap: 10px; }
.stat-line strong { color: var(--text); font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-size: 12.5px; }
.stat-pct { color: var(--text-faint); font-weight: 400; }
.stat-divider { height: 1px; background: var(--border); margin: 4px 0; }
.limiter-badge { text-align: center; font-size: 11.5px; font-family: 'IBM Plex Mono', monospace; padding: 7px; border-radius: 6px; font-weight: 600; }
.limiter-core { background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent); }
.limiter-io { background: color-mix(in srgb, #5B6572 24%, transparent); color: #B7C0CC; }

.floorplan-panel { }
.floorplan-canvas-wrap { display: flex; justify-content: center; background: #06090D; border: 1px solid var(--border); border-radius: 8px; padding: 10px; }
.floorplan-svg { max-width: 520px; }
.treemap-label { width: 100%; height: 100%; overflow: hidden; pointer-events: none; }
.treemap-label-name { font-size: 10px; font-weight: 600; color: #06100D; line-height: 1.25; font-family: 'IBM Plex Sans', sans-serif; }
.treemap-label-sub { font-size: 9px; color: #06100Daa; font-family: 'IBM Plex Mono', monospace; margin-top: 1px; }

.legend-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--text-dim); }
.legend-item i { width: 9px; height: 9px; border-radius: 2px; display: inline-block; }

.pitch-note { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--text-dim); background: var(--panel-2); border: 1px dashed var(--border); border-radius: 6px; padding: 8px 11px; margin-top: 10px; }
.pitch-note strong { color: var(--text); font-family: 'IBM Plex Mono', monospace; }

.contrib-list { display: flex; flex-direction: column; gap: 8px; max-height: 560px; overflow-y: auto; }
.contrib-row { display: flex; align-items: center; gap: 10px; }
.contrib-rank { width: 18px; text-align: center; font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--text-faint); }
.contrib-main { flex: 1; min-width: 0; }
.contrib-name { font-size: 12px; display: flex; align-items: center; gap: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
.contrib-bar-track { height: 5px; background: var(--panel-2); border-radius: 3px; overflow: hidden; }
.contrib-bar-fill { height: 100%; border-radius: 3px; }
.contrib-val { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: var(--text); width: 70px; text-align: right; }
.contrib-unit { color: var(--text-faint); font-size: 10px; margin-left: 3px; }
`;
