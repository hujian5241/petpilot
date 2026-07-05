import fs from "fs/promises"
import path from "path"
import matter from "gray-matter"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

const MODEL = "claude-sonnet-4-6"
const MAX_CONCURRENCY = 1
const MAX_RETRIES = 3
const MIN_REQUEST_INTERVAL_MS = 500

interface SeedEntry {
  type: "medications" | "household-chemicals" | "pesticides"
  slug: string
  name: string
  aliases: string[]
  categories: string[]
  tags: string[]
  notes?: string
}

const seedEntries: SeedEntry[] = [
  // Medications (40)
  { type: "medications", slug: "acetaminophen", name: "Acetaminophen", aliases: ["paracetamol", "Tylenol", "Panadol"], categories: ["human-medications", "pain-relief"], tags: ["otc", "pain-relief"], notes: "Highly toxic to cats; causes methemoglobinemia and liver damage." },
  { type: "medications", slug: "ibuprofen", name: "Ibuprofen", aliases: ["Advil", "Motrin", "Nurofen"], categories: ["human-medications", "pain-relief"], tags: ["otc", "nsaid"], notes: "Causes ulcers and kidney failure in dogs and cats." },
  { type: "medications", slug: "naproxen", name: "Naproxen", aliases: ["Aleve", "Naprosyn"], categories: ["human-medications", "pain-relief"], tags: ["otc", "nsaid"], notes: "NSAID toxic to pets." },
  { type: "medications", slug: "aspirin", name: "Aspirin", aliases: ["acetylsalicylic acid", "Bayer"], categories: ["human-medications", "pain-relief"], tags: ["otc", "salicylate"], notes: "Cats are especially sensitive; dogs may use under vet guidance only." },
  { type: "medications", slug: "pseudoephedrine", name: "Pseudoephedrine", aliases: ["Sudafed", "decongestant"], categories: ["human-medications", "cold-flu"], tags: ["otc", "decongestant"], notes: "Stimulant causing hyperactivity, tremors, seizures." },
  { type: "medications", slug: "phenylephrine", name: "Phenylephrine", aliases: ["Sudafed PE"], categories: ["human-medications", "cold-flu"], tags: ["otc", "decongestant"], notes: "Can elevate blood pressure and cause tremors." },
  { type: "medications", slug: "dextromethorphan", name: "Dextromethorphan", aliases: ["DXM", "Robitussin DM"], categories: ["human-medications", "cold-flu"], tags: ["otc", "cough-suppressant"], notes: "Causes sedation, agitation, ataxia." },
  { type: "medications", slug: "guaifenesin", name: "Guaifenesin", aliases: ["Mucinex", "expectorant"], categories: ["human-medications", "cold-flu"], tags: ["otc", "expectorant"], notes: "Usually mild GI upset; watch for combination products." },
  { type: "medications", slug: "diphenhydramine", name: "Diphenhydramine", aliases: ["Benadryl"], categories: ["human-medications", "cold-flu"], tags: ["otc", "antihistamine"], notes: "Veterinary use possible with guidance; overdose causes sedation/dry mouth." },
  { type: "medications", slug: "loratadine", name: "Loratadine", aliases: ["Claritin"], categories: ["human-medications", "cold-flu"], tags: ["otc", "antihistamine"], notes: "Non-sedating antihistamine; use only under vet guidance." },
  { type: "medications", slug: "cetirizine", name: "Cetirizine", aliases: ["Zyrtec"], categories: ["human-medications", "cold-flu"], tags: ["otc", "antihistamine"], notes: "Generally safer antihistamine but dosing is species-specific." },
  { type: "medications", slug: "fexofenadine", name: "Fexofenadine", aliases: ["Allegra"], categories: ["human-medications", "cold-flu"], tags: ["otc", "antihistamine"], notes: "Non-sedating antihistamine." },
  { type: "medications", slug: "omeprazole", name: "Omeprazole", aliases: ["Prilosec"], categories: ["human-medications"], tags: ["otc", "ppi"], notes: "Proton pump inhibitor; sometimes used in veterinary medicine." },
  { type: "medications", slug: "ranitidine", name: "Ranitidine", aliases: ["Zantac"], categories: ["human-medications"], tags: ["otc", "h2-blocker"], notes: "H2 blocker; generally low toxicity." },
  { type: "medications", slug: "loperamide", name: "Loperamide", aliases: ["Imodium"], categories: ["human-medications"], tags: ["otc", "anti-diarrheal"], notes: "Toxic to some herding dogs due to MDR1 mutation; can cause sedation." },
  { type: "medications", slug: "bisacodyl", name: "Bisacodyl", aliases: ["Dulcolax"], categories: ["human-medications"], tags: ["otc", "laxative"], notes: "Can cause severe cramping and electrolyte imbalance." },
  { type: "medications", slug: "multivitamins-with-iron", name: "Multivitamins with Iron", aliases: ["iron supplements", "prenatal vitamins"], categories: ["human-medications"], tags: ["otc", "supplement"], notes: "Iron can cause gastrointestinal damage and liver failure." },
  { type: "medications", slug: "vitamin-d", name: "Vitamin D Supplements", aliases: ["cholecalciferol", "D3"], categories: ["human-medications"], tags: ["otc", "supplement"], notes: "High doses cause hypercalcemia and kidney damage." },
  { type: "medications", slug: "fluoride-toothpaste", name: "Fluoride Toothpaste", aliases: ["toothpaste"], categories: ["human-medications", "personal-care-products"], tags: ["dental", "fluoride"], notes: "Large ingestion can cause vomiting and fluoride toxicity." },
  { type: "medications", slug: "benzocaine", name: "Benzocaine", aliases: ["Orajel", "topical anesthetic"], categories: ["human-medications"], tags: ["otc", "topical"], notes: "Can cause methemoglobinemia." },
  { type: "medications", slug: "fluoxetine", name: "Fluoxetine", aliases: ["Prozac"], categories: ["human-medications", "antidepressants"], tags: ["prescription", "ssri"], notes: "Can cause serotonin syndrome in overdose." },
  { type: "medications", slug: "sertraline", name: "Sertraline", aliases: ["Zoloft"], categories: ["human-medications", "antidepressants"], tags: ["prescription", "ssri"], notes: "SSRI; can cause agitation and tremors." },
  { type: "medications", slug: "paroxetine", name: "Paroxetine", aliases: ["Paxil"], categories: ["human-medications", "antidepressants"], tags: ["prescription", "ssri"], notes: "SSRI with shorter half-life; withdrawal possible." },
  { type: "medications", slug: "alprazolam", name: "Alprazolam", aliases: ["Xanax"], categories: ["human-medications", "antidepressants"], tags: ["prescription", "benzodiazepine"], notes: "Can cause profound sedation and paradoxical agitation." },
  { type: "medications", slug: "lorazepam", name: "Lorazepam", aliases: ["Ativan"], categories: ["human-medications", "antidepressants"], tags: ["prescription", "benzodiazepine"], notes: "Sedation, ataxia, respiratory depression." },
  { type: "medications", slug: "trazodone", name: "Trazodone", aliases: ["Desyrel"], categories: ["human-medications", "antidepressants"], tags: ["prescription", "antidepressant"], notes: "Used in veterinary medicine but overdoses cause sedation and serotonin syndrome." },
  { type: "medications", slug: "amitriptyline", name: "Amitriptyline", aliases: ["Elavil"], categories: ["human-medications", "antidepressants"], tags: ["prescription", "tca"], notes: "Tricyclic antidepressant; highly toxic causing seizures and arrhythmias." },
  { type: "medications", slug: "lisinopril", name: "Lisinopril", aliases: ["Prinivil", "Zestril"], categories: ["human-medications", "heart-blood-pressure"], tags: ["prescription", "ace-inhibitor"], notes: "Can cause dangerously low blood pressure." },
  { type: "medications", slug: "amlodipine", name: "Amlodipine", aliases: ["Norvasc"], categories: ["human-medications", "heart-blood-pressure"], tags: ["prescription", "calcium-channel-blocker"], notes: "Causes low blood pressure and heart rate changes." },
  { type: "medications", slug: "metoprolol", name: "Metoprolol", aliases: ["Lopressor"], categories: ["human-medications", "heart-blood-pressure"], tags: ["prescription", "beta-blocker"], notes: "Can cause severe bradycardia and hypotension." },
  { type: "medications", slug: "atenolol", name: "Atenolol", aliases: ["Tenormin"], categories: ["human-medications", "heart-blood-pressure"], tags: ["prescription", "beta-blocker"], notes: "Beta-blocker; low blood pressure and bradycardia." },
  { type: "medications", slug: "furosemide", name: "Furosemide", aliases: ["Lasix"], categories: ["human-medications", "heart-blood-pressure"], tags: ["prescription", "diuretic"], notes: "Causes dehydration and electrolyte imbalances." },
  { type: "medications", slug: "digoxin", name: "Digoxin", aliases: ["Lanoxin"], categories: ["human-medications", "heart-blood-pressure"], tags: ["prescription", "cardiac-glycoside"], notes: "Narrow safety margin; causes arrhythmias." },
  { type: "medications", slug: "warfarin", name: "Warfarin", aliases: ["Coumadin", "blood thinner"], categories: ["human-medications", "heart-blood-pressure"], tags: ["prescription", "anticoagulant"], notes: "Causes internal bleeding." },
  { type: "medications", slug: "clopidogrel", name: "Clopidogrel", aliases: ["Plavix"], categories: ["human-medications", "heart-blood-pressure"], tags: ["prescription", "antiplatelet"], notes: "Increased bleeding risk." },
  { type: "medications", slug: "atorvastatin", name: "Atorvastatin", aliases: ["Lipitor"], categories: ["human-medications", "heart-blood-pressure"], tags: ["prescription", "statin"], notes: "Generally low toxicity but can cause GI upset and muscle damage at high doses." },
  { type: "medications", slug: "metformin", name: "Metformin", aliases: ["Glucophage"], categories: ["human-medications"], tags: ["prescription", "diabetes"], notes: "Can cause low blood sugar and lactic acidosis." },
  { type: "medications", slug: "insulin", name: "Insulin", aliases: ["human insulin"], categories: ["human-medications"], tags: ["prescription", "diabetes"], notes: "Causes life-threatening hypoglycemia." },
  { type: "medications", slug: "carprofen", name: "Carprofen", aliases: ["Rimadyl"], categories: ["vet-medications", "pain-relief"], tags: ["vet", "nsaid"], notes: "Veterinary NSAID; overdoses cause ulcers and kidney damage." },
  { type: "medications", slug: "meloxicam", name: "Meloxicam", aliases: ["Metacam"], categories: ["vet-medications", "pain-relief"], tags: ["vet", "nsaid"], notes: "Veterinary NSAID; toxicity from overdose or use in cats." },
  { type: "medications", slug: "ivermectin", name: "Ivermectin", aliases: ["Heartgard"], categories: ["vet-medications"], tags: ["vet", "antiparasitic"], notes: "Safe at label dose in dogs; toxic at high doses, especially in MDR1 dogs." },

  // Household chemicals (30)
  { type: "household-chemicals", slug: "bleach", name: "Bleach", aliases: ["sodium hypochlorite", "chlorine bleach"], categories: ["cleaning-products"], tags: ["cleaner", "corrosive"], notes: "Corrosive to mouth, esophagus, and stomach." },
  { type: "household-chemicals", slug: "ammonia", name: "Ammonia", aliases: ["ammonium hydroxide"], categories: ["cleaning-products"], tags: ["cleaner", "irritant"], notes: "Respiratory and ocular irritant." },
  { type: "household-chemicals", slug: "hydrogen-peroxide", name: "Hydrogen Peroxide", aliases: ["peroxide"], categories: ["cleaning-products", "personal-care-products"], tags: ["disinfectant", "topical"], notes: "3% may be used to induce vomiting under vet guidance; higher concentrations are corrosive." },
  { type: "household-chemicals", slug: "rubbing-alcohol", name: "Rubbing Alcohol", aliases: ["isopropyl alcohol", "isopropanol"], categories: ["personal-care-products", "cleaning-products"], tags: ["disinfectant", "alcohol"], notes: "Causes vomiting, ataxia, respiratory depression, hypoglycemia." },
  { type: "household-chemicals", slug: "antifreeze", name: "Antifreeze", aliases: ["ethylene glycol", "coolant"], categories: ["automotive-products"], tags: ["automotive", "toxic"], notes: "Extremely toxic; sweet taste; causes kidney failure." },
  { type: "household-chemicals", slug: "windshield-washer-fluid", name: "Windshield Washer Fluid", aliases: ["methanol", "washer fluid"], categories: ["automotive-products"], tags: ["automotive", "toxic"], notes: "Methanol causes metabolic acidosis and blindness." },
  { type: "household-chemicals", slug: "toilet-bowl-cleaner", name: "Toilet Bowl Cleaner", aliases: ["acidic toilet cleaner"], categories: ["cleaning-products"], tags: ["cleaner", "corrosive"], notes: "Strong acids or bases; corrosive." },
  { type: "household-chemicals", slug: "drain-cleaner", name: "Drain Cleaner", aliases: ["liquid plumber", "Drano"], categories: ["cleaning-products"], tags: ["cleaner", "corrosive"], notes: "Caustic; causes severe burns." },
  { type: "household-chemicals", slug: "oven-cleaner", name: "Oven Cleaner", aliases: ["lye", "sodium hydroxide"], categories: ["cleaning-products"], tags: ["cleaner", "corrosive"], notes: "Caustic burns to mouth and esophagus." },
  { type: "household-chemicals", slug: "dishwasher-detergent", name: "Dishwasher Detergent", aliases: ["dish detergent", "dish soap"], categories: ["cleaning-products", "laundry-products"], tags: ["cleaner", "irritant"], notes: "Concentrated detergent causes GI upset and oral ulcers." },
  { type: "household-chemicals", slug: "laundry-detergent", name: "Laundry Detergent", aliases: ["washing powder", "liquid detergent"], categories: ["laundry-products"], tags: ["cleaner", "irritant"], notes: "Pods are especially attractive and toxic." },
  { type: "household-chemicals", slug: "fabric-softener", name: "Fabric Softener", aliases: ["liquid softener"], categories: ["laundry-products"], tags: ["cleaner", "irritant"], notes: "Cationic surfactants cause GI upset and oral ulcers." },
  { type: "household-chemicals", slug: "dryer-sheets", name: "Dryer Sheets", aliases: ["fabric softener sheets"], categories: ["laundry-products"], tags: ["cleaner", "irritant"], notes: "Low toxicity but can cause GI upset." },
  { type: "household-chemicals", slug: "all-purpose-cleaner", name: "All-Purpose Cleaner", aliases: ["multi-surface cleaner"], categories: ["cleaning-products"], tags: ["cleaner", "irritant"], notes: "Irritation and GI upset depending on ingredients." },
  { type: "household-chemicals", slug: "glass-cleaner", name: "Glass Cleaner", aliases: ["Windex", "ammonia cleaner"], categories: ["cleaning-products"], tags: ["cleaner", "irritant"], notes: "Ammonia and detergents cause irritation." },
  { type: "household-chemicals", slug: "floor-cleaner", name: "Floor Cleaner", aliases: ["mop solution", "pine cleaner"], categories: ["cleaning-products"], tags: ["cleaner", "irritant"], notes: "Phenol-based cleaners are particularly toxic to cats." },
  { type: "household-chemicals", slug: "disinfectant-wipes", name: "Disinfectant Wipes", aliases: ["sanitizing wipes"], categories: ["cleaning-products"], tags: ["cleaner", "disinfectant"], notes: "Chemicals cause oral irritation and GI upset." },
  { type: "household-chemicals", slug: "pine-sol", name: "Pine-Sol", aliases: ["phenol cleaner", "pine cleaner"], categories: ["cleaning-products"], tags: ["cleaner", "phenol"], notes: "Phenol-based cleaners are toxic to cats and dogs." },
  { type: "household-chemicals", slug: "mothballs", name: "Mothballs", aliases: ["naphthalene", "paradichlorobenzene"], categories: ["home-improvement", "pesticides"], tags: ["pesticide", "toxic"], notes: "Causes hemolysis in cats and liver/kidney damage." },
  { type: "household-chemicals", slug: "air-freshener", name: "Air Freshener", aliases: ["room spray", "deodorizer"], categories: ["home-improvement"], tags: ["fragrance", "irritant"], notes: "Essential oils and VOCs can irritate airways." },
  { type: "household-chemicals", slug: "tea-tree-oil", name: "Tea Tree Oil", aliases: ["melaleuca oil"], categories: ["personal-care-products"], tags: ["essential-oil", "toxic"], notes: "Toxic to dogs and cats even when applied to skin." },
  { type: "household-chemicals", slug: "eucalyptus-oil", name: "Eucalyptus Oil", aliases: ["eucalyptus essential oil"], categories: ["personal-care-products"], tags: ["essential-oil", "toxic"], notes: "Can cause salivation, vomiting, tremors, and seizures." },
  { type: "household-chemicals", slug: "peppermint-oil", name: "Peppermint Oil", aliases: ["peppermint essential oil"], categories: ["personal-care-products"], tags: ["essential-oil", "irritant"], notes: "Can cause vomiting and diarrhea." },
  { type: "household-chemicals", slug: "scented-candles", name: "Scented Candles", aliases: ["candles", "fragrance candles"], categories: ["home-improvement"], tags: ["fragrance", "irritant"], notes: "Wax ingestion usually mild; scented oils may irritate; watch for burns." },
  { type: "household-chemicals", slug: "potpourri", name: "Potpourri", aliases: ["simmering potpourri"], categories: ["home-improvement"], tags: ["fragrance", "irritant"], notes: "Hot liquid causes burns; essential oils can be toxic." },
  { type: "household-chemicals", slug: "paint", name: "Paint", aliases: ["latex paint", "oil paint"], categories: ["home-improvement"], tags: ["paint", "irritant"], notes: "Water-based paint usually mild; oil-based can be more toxic." },
  { type: "household-chemicals", slug: "paint-thinner", name: "Paint Thinner", aliases: ["mineral spirits", "turpentine"], categories: ["home-improvement"], tags: ["solvent", "toxic"], notes: "Hydrocarbons cause aspiration pneumonia." },
  { type: "household-chemicals", slug: "glue", name: "Glue", aliases: ["adhesive", "super glue"], categories: ["home-improvement"], tags: ["adhesive", "irritant"], notes: "Most glues are low toxicity but can cause obstruction." },
  { type: "household-chemicals", slug: "nail-polish-remover", name: "Nail Polish Remover", aliases: ["acetone"], categories: ["personal-care-products"], tags: ["solvent", "irritant"], notes: "Acetone causes vomiting and ataxia; fumes irritate." },
  { type: "household-chemicals", slug: "hair-dye", name: "Hair Dye", aliases: ["permanent hair color"], categories: ["personal-care-products"], tags: ["chemical", "irritant"], notes: "Ammonia and peroxide cause skin and GI irritation." },
  { type: "household-chemicals", slug: "bleach-and-ammonia-mix", name: "Bleach and Ammonia Mix", aliases: ["chloramine gas"], categories: ["cleaning-products"], tags: ["toxic-gas", "corrosive"], notes: "Produces chloramine gas; severe respiratory damage." },

  // Pesticides (30)
  { type: "pesticides", slug: "ant-bait-borax", name: "Ant Bait (Borax)", aliases: ["borax ant bait", "terro"], categories: ["insecticides"], tags: ["insecticide", "borate"], notes: "Borax can cause vomiting and kidney damage in large amounts." },
  { type: "pesticides", slug: "cockroach-gel-bait", name: "Cockroach Gel Bait", aliases: ["roach bait", "gel bait"], categories: ["insecticides"], tags: ["insecticide", "bait"], notes: "Usually low toxicity but attractants can be tasty to pets." },
  { type: "pesticides", slug: "fipronil", name: "Fipronil", aliases: ["Frontline"], categories: ["insecticides"], tags: ["insecticide", "flea-treatment"], notes: "Dog products can be toxic to cats; overdoses cause neurological signs." },
  { type: "pesticides", slug: "imidacloprid", name: "Imidacloprid", aliases: ["Advantage"], categories: ["insecticides"], tags: ["insecticide", "neonicotinoid"], notes: "Generally safe at label doses; ingestion of concentrate can be toxic." },
  { type: "pesticides", slug: "pyrethrin", name: "Pyrethrin", aliases: ["natural insecticide"], categories: ["insecticides"], tags: ["insecticide", "natural"], notes: "Toxic to cats; can cause tremors and seizures." },
  { type: "pesticides", slug: "pyrethroid", name: "Pyrethroid", aliases: ["synthetic pyrethrin"], categories: ["insecticides"], tags: ["insecticide", "synthetic"], notes: "Permethrin and related compounds are highly toxic to cats." },
  { type: "pesticides", slug: "permethrin", name: "Permethrin", aliases: ["dog flea treatment"], categories: ["insecticides"], tags: ["insecticide", "pyrethroid"], notes: "Highly toxic to cats; causes tremors and seizures." },
  { type: "pesticides", slug: "deet", name: "DEET", aliases: ["insect repellent", "bug spray"], categories: ["insecticides"], tags: ["repellent", "chemical"], notes: "Can cause neurological signs and vomiting." },
  { type: "pesticides", slug: "warfarin-rodenticide", name: "Warfarin Rodenticide", aliases: ["anticoagulant rat poison"], categories: ["rodenticides"], tags: ["rodenticide", "anticoagulant"], notes: "Causes internal bleeding 1-3 days after ingestion." },
  { type: "pesticides", slug: "bromethalin", name: "Bromethalin", aliases: ["neurotoxic rodenticide"], categories: ["rodenticides"], tags: ["rodenticide", "neurotoxic"], notes: "Causes brain swelling and seizures; no antidote." },
  { type: "pesticides", slug: "cholecalciferol", name: "Cholecalciferol Rodenticide", aliases: ["vitamin D3 bait", "mouse poison"], categories: ["rodenticides"], tags: ["rodenticide", "vitamin-d"], notes: "Causes hypercalcemia and kidney failure." },
  { type: "pesticides", slug: "zinc-phosphide", name: "Zinc Phosphide", aliases: ["gopher bait", "mole bait"], categories: ["rodenticides"], tags: ["rodenticide", "phosphide"], notes: "Releases phosphine gas; highly toxic." },
  { type: "pesticides", slug: "metaldehyde", name: "Metaldehyde", aliases: ["slug bait", "snail bait"], categories: ["molluscicides"], tags: ["molluscicide", "toxic"], notes: "Causes seizures and hyperthermia; very dangerous." },
  { type: "pesticides", slug: "iron-phosphate", name: "Iron Phosphate", aliases: ["sluggo", "pet-safe slug bait"], categories: ["molluscicides"], tags: ["molluscicide", "low-toxicity"], notes: "Generally considered low toxicity but can cause GI upset." },
  { type: "pesticides", slug: "glyphosate", name: "Glyphosate", aliases: ["Roundup", "weed killer"], categories: ["herbicides"], tags: ["herbicide", "non-selective"], notes: "Causes GI upset and oral irritation; surfactants increase toxicity." },
  { type: "pesticides", slug: "two-four-d", name: "2,4-D", aliases: ["broadleaf herbicide"], categories: ["herbicides"], tags: ["herbicide", "phenoxy"], notes: "Can cause vomiting, diarrhea, and muscle weakness." },
  { type: "pesticides", slug: "dicamba", name: "Dicamba", aliases: ["broadleaf herbicide"], categories: ["herbicides"], tags: ["herbicide"], notes: "GI upset and muscle weakness possible." },
  { type: "pesticides", slug: "fungicide", name: "Fungicide", aliases: ["mold control", "mildew spray"], categories: ["fungicides"], tags: ["fungicide"], notes: "Ingredients vary; many cause GI upset and irritation." },
  { type: "pesticides", slug: "snail-bait", name: "Snail Bait", aliases: ["slug and snail bait"], categories: ["molluscicides"], tags: ["molluscicide"], notes: "Often contains metaldehyde or iron phosphate." },
  { type: "pesticides", slug: "insecticide-spray", name: "Insecticide Spray", aliases: ["bug spray", "aerosol insecticide"], categories: ["insecticides"], tags: ["insecticide", "aerosol"], notes: "Pyrethroids and solvents can be toxic." },
  { type: "pesticides", slug: "wasp-spray", name: "Wasp Spray", aliases: ["hornet spray", "aerosol wasp killer"], categories: ["insecticides"], tags: ["insecticide", "aerosol"], notes: "Pyrethroids and propellants cause irritation and neurotoxicity." },
  { type: "pesticides", slug: "mosquito-spray", name: "Mosquito Spray", aliases: ["yard mosquito treatment"], categories: ["insecticides"], tags: ["insecticide", "outdoor"], notes: "Pyrethroids; toxic to cats and aquatic life." },
  { type: "pesticides", slug: "flea-collar", name: "Flea Collar", aliases: ["insecticide collar"], categories: ["insecticides"], tags: ["flea-control", "collar"], notes: "Amitraz, organophosphates, or pyrethroids; toxicity if chewed." },
  { type: "pesticides", slug: "flea-shampoo", name: "Flea Shampoo", aliases: ["flea and tick shampoo"], categories: ["insecticides"], tags: ["flea-control", "topical"], notes: "Pyrethrin/pyrethroid shampoos can be toxic to cats." },
  { type: "pesticides", slug: "flea-tick-spot-on", name: "Flea and Tick Spot-On", aliases: ["topical flea treatment"], categories: ["insecticides"], tags: ["flea-control", "topical"], notes: "Dog products on cats can be fatal." },
  { type: "pesticides", slug: "lawn-insecticide", name: "Lawn Insecticide", aliases: ["grub control", "lawn bug killer"], categories: ["insecticides"], tags: ["insecticide", "outdoor"], notes: "Granules and sprays contain various insecticides." },
  { type: "pesticides", slug: "termite-treatment", name: "Termite Treatment", aliases: ["termite spray", "soil treatment"], categories: ["insecticides"], tags: ["insecticide", "termite"], notes: "Fipronil or termiticides; keep pets away until dry." },
  { type: "pesticides", slug: "naphthalene", name: "Naphthalene", aliases: ["moth balls", "moth crystals"], categories: ["pesticides", "home-improvement"], tags: ["pesticide", "moth-repellent"], notes: "Causes hemolysis, especially in cats." },
  { type: "pesticides", slug: "paradichlorobenzene", name: "Paradichlorobenzene", aliases: ["moth repellent", "PDB"], categories: ["pesticides", "home-improvement"], tags: ["pesticide", "moth-repellent"], notes: "Causes liver and kidney damage." },
  { type: "pesticides", slug: "boric-acid", name: "Boric Acid", aliases: ["borax", "borate"], categories: ["insecticides"], tags: ["insecticide", "borate"], notes: "Low to moderate toxicity; can cause vomiting and kidney damage in large amounts." },
  { type: "pesticides", slug: "amitraz", name: "Amitraz", aliases: ["tick collar", "Mitaban"], categories: ["insecticides"], tags: ["insecticide", "tick-control"], notes: "Causes sedation, low blood sugar, and bradycardia." },
]

const systemPrompt = `You are a veterinary toxicology content writer for PetPilot, a pet safety website. Your task is to write accurate, responsible Markdown articles about medications, household chemicals, and pesticides that may be toxic to dogs and cats.

Rules:
- Output ONLY a valid Markdown file with YAML front matter between --- lines, followed by a brief Markdown body.
- Use these exact front matter keys and types:
  - id: string
  - name: string
  - slug: string
  - aliases: string[]
  - categories: string[]
  - tags: string[]
  - safety: { dogs: { status, severity, summary }, cats: { status, severity, summary } } where status is one of safe/limited/toxic/unknown and severity is one of low/moderate/high/critical.
  - symptoms: string[]
  - what_to_do: string (concise emergency instructions)
  - requires_emergency_visit: boolean
  - alternatives: string[] (slugs of safer alternatives, e.g. ["vet-prescribed-pain-relief"])
  - active_ingredients: string[] (required for medications and pesticides; optional for household chemicals)
  - sources: [{ name, url }]
  - vet_reviewed: boolean (always false)
  - last_reviewed: YYYY-MM-DD
  - meta_title: string
  - meta_description: string
- Add type-specific fields when relevant:
  - medications: brand_names, dosage_form, common_uses, toxic_ingredients, is_veterinary, requires_prescription
  - household-chemicals: common_products, room, ventilation_notes, dilution_warning, contains_bleach, contains_ammonia, contains_phenols
  - pesticides: pest_targeted, formulation, signal_word (caution/warning/danger), application_area, epa_registration_number
- The Markdown body should be 2-4 short paragraphs with a clear warning, how exposure happens, and prevention tips.
- Be accurate and conservative. If unsure, mark status as unknown or limited rather than safe.
- Do not invent EPA registration numbers; either omit or use a placeholder like "EPA Reg. No. varies by product".
- Keep all summaries factual and avoid minimizing risk.`

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function generateMarkdown(
  seed: SeedEntry,
  attempt = 0
): Promise<string> {
  const identifier = `${seed.type}/${seed.slug}`
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Write a complete Markdown article for PetPilot with YAML front matter for the following item:

Type: ${seed.type}
Name: ${seed.name}
Slug: ${seed.slug}
Aliases: ${seed.aliases.join(", ")}
Categories: ${seed.categories.join(", ")}
Tags: ${seed.tags.join(", ")}
Notes: ${seed.notes || ""}

Include the field
content: |
  <2-4 paragraphs of Markdown body>
in the front matter. Return only the Markdown file.`,
        },
      ],
    })

    let text = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { text: string }).text)
      .join("")

    const frontMatterStart = text.indexOf("---")
    if (frontMatterStart === -1) {
      throw new Error(`Model did not return YAML front matter for ${identifier}`)
    }
    if (frontMatterStart > 0) {
      text = text.slice(frontMatterStart)
    }
    text = text.replace(/\s*```\s*$/g, "")

    // Validate
    matter(text)
    return text
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      const delay = 2000 * 2 ** attempt + Math.floor(Math.random() * 1000)
      console.warn(`  Retry ${attempt + 1}/${MAX_RETRIES} for ${identifier} in ${delay}ms`)
      await sleep(delay)
      return generateMarkdown(seed, attempt + 1)
    }
    throw error
  }
}

async function main() {
  const args = process.argv.slice(2)
  const limitArg = args.find((arg) => arg.startsWith("--limit="))?.split("=")[1]
  const limit = limitArg ? parseInt(limitArg, 10) : undefined
  const force = args.includes("--force")

  const entries = limit ? seedEntries.slice(0, limit) : seedEntries
  console.log(`Generating ${entries.length} hazard entries...`)

  let completed = 0
  let lastRequestTime = 0

  for (const seed of entries) {
    const targetPath = path.join(process.cwd(), "content", "en", seed.type, `${seed.slug}.md`)

    if (!force) {
      try {
        await fs.access(targetPath)
        console.log(`  Skipping ${seed.type}/${seed.slug} (already exists)`)
        completed++
        continue
      } catch {
        // proceed
      }
    }

    const now = Date.now()
    const elapsed = now - lastRequestTime
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await sleep(MIN_REQUEST_INTERVAL_MS - elapsed)
    }
    lastRequestTime = Date.now()

    try {
      const markdown = await generateMarkdown(seed)
      await fs.mkdir(path.dirname(targetPath), { recursive: true })
      await fs.writeFile(targetPath, markdown, "utf-8")
      completed++
      console.log(`  Generated ${seed.type}/${seed.slug} (${completed}/${entries.length})`)
    } catch (error) {
      console.error(`  Failed ${seed.type}/${seed.slug}: ${(error as Error).message}`)
    }
  }

  console.log(`\nDone. ${completed}/${entries.length} entries generated.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
