interface FoodData {
  id: string
  name: string
  slug: string
  aliases: string[]
  categories: string[]
  tags: string[]
  safetyDogs: { status: string; severity?: string; summary: string }
  safetyCats: { status: string; severity?: string; summary: string }
  preparationNotes?: string
  safeAmount?: string
  frequency?: string
  dosagePerWeight?: string
  symptoms: string[]
  symptomsSeverity?: { symptom: string; severity: string }[]
  whatToDo: string
  requiresEmergencyVisit: boolean
  alternatives: string[]
  relatedFoods?: string[]
  lookalikes?: string[]
  sources?: { name: string; url?: string }[]
  notesForPuppies?: string
  notesForKittens?: string
  body: string
}

export const nuts: FoodData[] = [
  {
    id: "peanuts",
    name: "Peanuts",
    slug: "peanuts",
    aliases: ["peanut", "groundnut"],
    categories: ["nuts"],
    tags: ["legume", "high-fat", "choking-risk"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary:
        "Not toxic, but high in fat and can cause stomach upset or pancreatitis in large amounts.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary:
        "Small amounts are usually tolerated, but high fat can upset the stomach.",
    },
    preparationNotes:
      "Use plain, unsalted, shelled peanuts. Avoid flavored, salted, or chocolate-covered peanuts.",
    safeAmount:
      "A few plain peanuts for larger dogs; one or two for small dogs.",
    frequency: "Very occasional treat.",
    symptoms: [
      "vomiting",
      "diarrhea",
      "gas",
      "pancreatitis",
      "choking",
    ],
    whatToDo:
      "Monitor for vomiting or diarrhea. Contact your vet if your pet ate a large amount or shows signs of pancreatitis.",
    requiresEmergencyVisit: false,
    alternatives: ["carrots", "apple-slices", "green-beans"],
    relatedFoods: ["peanut-butter"],
    sources: [
      { name: "ASPCA", url: "https://www.aspca.org/pet-care/animal-poison-control" },
      { name: "American Kennel Club", url: "https://www.akc.org/" },
    ],
    notesForPuppies: "Whole peanuts can be a choking hazard for puppies.",
    notesForKittens: "Avoid whole peanuts due to choking risk.",
    body: `Peanuts are not truly nuts; they are legumes. Plain, unsalted peanuts are generally safe for dogs in very small amounts, but their high fat content can lead to stomach upset or pancreatitis. Salted or flavored peanuts can cause sodium problems.

Cats may tolerate a tiny taste, but peanuts offer little nutritional value and can cause digestive upset. Always avoid peanuts coated in chocolate, xylitol, or other dangerous ingredients.`,
  },
  {
    id: "almonds",
    name: "Almonds",
    slug: "almonds",
    aliases: [],
    categories: ["nuts"],
    tags: ["high-fat", "choking-risk"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary: "Not toxic, but hard to digest and may cause obstruction.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Not recommended; can cause stomach upset.",
    },
    preparationNotes:
      "Plain, unsalted almonds only. Avoid chocolate-covered or salted varieties.",
    safeAmount: "One or two almonds at most for a large dog; avoid for small dogs.",
    frequency: "Rarely.",
    symptoms: ["vomiting", "diarrhea", "intestinal-blockage", "choking"],
    whatToDo:
      "Contact your vet if your pet ate many almonds or shows signs of blockage.",
    requiresEmergencyVisit: false,
    alternatives: ["carrots", "apple-slices", "peanut-butter"],
    relatedFoods: ["almond-butter"],
    sources: [
      { name: "ASPCA", url: "https://www.aspca.org/pet-care/animal-poison-control" },
      { name: "American Kennel Club", url: "https://www.akc.org/" },
    ],
    body: `Almonds are not toxic to dogs, but they are difficult to digest and can cause gastrointestinal upset. Whole almonds can also pose a choking hazard or cause intestinal blockage, especially in small dogs.

Cats should avoid almonds because their digestive systems are not designed to process nuts. Choose safer treats such as carrots or apple slices instead.`,
  },
  {
    id: "cashews",
    name: "Cashews",
    slug: "cashews",
    aliases: [],
    categories: ["nuts"],
    tags: ["high-fat"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary: "Plain cashews are safe in very small amounts.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Small amounts may be tolerated, but not recommended.",
    },
    preparationNotes:
      "Plain, unsalted, roasted or raw cashews. Avoid salted, flavored, or chocolate-covered cashews.",
    safeAmount: "A few cashews for large dogs; one for small dogs.",
    frequency: "Rarely due to high fat.",
    symptoms: [
      "upset-stomach",
      "vomiting",
      "diarrhea",
      "pancreatitis",
      "weight-gain",
    ],
    whatToDo:
      "Stop feeding and monitor. Contact your vet if vomiting, diarrhea, or lethargy persists.",
    requiresEmergencyVisit: false,
    alternatives: ["peanut-butter", "carrots", "green-beans"],
    relatedFoods: ["cashew-butter"],
    sources: [{ name: "American Kennel Club", url: "https://www.akc.org/" }],
    body: `Cashews are generally safe for dogs when plain and unsalted, but they are high in fat. Too many can cause stomach upset or contribute to pancreatitis. Salted or flavored cashews should be avoided.

Cats do not need nuts in their diet, and cashews can cause digestive upset. Keep portion sizes very small if offered at all.`,
  },
  {
    id: "walnuts",
    name: "Walnuts",
    slug: "walnuts",
    aliases: ["english-walnuts"],
    categories: ["nuts"],
    tags: ["high-fat", "mold-risk"],
    safetyDogs: {
      status: "limited",
      severity: "moderate",
      summary:
        "English walnuts are not highly toxic, but moldy walnuts can cause seizures.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Not recommended; high fat and possible mold risk.",
    },
    preparationNotes:
      "Only plain, fresh, shelled walnuts. Never feed moldy or black walnuts.",
    safeAmount:
      "Avoid feeding walnuts when possible; one small piece very rarely.",
    frequency: "Avoid.",
    symptoms: ["vomiting", "diarrhea", "tremors", "seizures", "weakness"],
    whatToDo:
      "Contact your vet immediately if moldy walnuts were eaten or if tremors occur.",
    requiresEmergencyVisit: false,
    alternatives: ["carrots", "apple-slices", "blueberries"],
    relatedFoods: ["walnut-butter", "black-walnuts"],
    sources: [
      {
        name: "Pet Poison Helpline",
        url: "https://www.petpoisonhelpline.com/",
      },
      { name: "ASPCA", url: "https://www.aspca.org/pet-care/animal-poison-control" },
    ],
    body: `Plain English walnuts are not as dangerous as black walnuts, but they are high in fat and can cause gastrointestinal upset. The biggest concern is mold, which can produce tremorgenic mycotoxins leading to seizures.

Cats should avoid walnuts due to high fat content and the risk of mold. Safer treats include carrots and blueberries.`,
  },
  {
    id: "black-walnuts",
    name: "Black Walnuts",
    slug: "black-walnuts",
    aliases: [],
    categories: ["nuts"],
    tags: ["toxic", "neurotoxic", "mold-risk"],
    safetyDogs: {
      status: "toxic",
      severity: "high",
      summary: "Can cause tremors, seizures, and gastrointestinal distress.",
    },
    safetyCats: {
      status: "toxic",
      severity: "moderate",
      summary: "Avoid; can cause neurological and GI signs.",
    },
    symptoms: [
      "vomiting",
      "diarrhea",
      "tremors",
      "seizures",
      "weakness",
      "hyperthermia",
    ],
    symptomsSeverity: [
      { symptom: "seizures", severity: "critical" },
      { symptom: "tremors", severity: "high" },
    ],
    whatToDo:
      "Seek veterinary care immediately if black walnuts or moldy walnuts were eaten.",
    requiresEmergencyVisit: true,
    alternatives: ["carrots", "blueberries", "apple-slices"],
    relatedFoods: ["walnuts"],
    sources: [
      {
        name: "Pet Poison Helpline",
        url: "https://www.petpoisonhelpline.com/",
      },
      { name: "ASPCA", url: "https://www.aspca.org/pet-care/animal-poison-control" },
    ],
    body: `Black walnuts, especially moldy nuts, are dangerous to dogs and can cause tremors and seizures. The toxin is associated with mold on the nuts rather than the nut itself, but the risk is significant.

Even a small amount can lead to serious neurological signs. Keep black walnuts and walnut hulls away from pets and contact a veterinarian immediately if ingestion occurs.`,
  },
  {
    id: "pecans",
    name: "Pecans",
    slug: "pecans",
    aliases: [],
    categories: ["nuts"],
    tags: ["high-fat", "mold-risk"],
    safetyDogs: {
      status: "limited",
      severity: "moderate",
      summary: "Can cause GI upset and may contain harmful molds.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Not recommended; high fat.",
    },
    preparationNotes:
      "Plain, fresh, unsalted pecans only. Avoid pies and flavored pecans.",
    safeAmount: "Avoid feeding; if given, one small piece rarely.",
    frequency: "Rarely.",
    symptoms: [
      "vomiting",
      "diarrhea",
      "upset-stomach",
      "intestinal-blockage",
    ],
    whatToDo:
      "Contact your vet if your pet ate a large amount or shows signs of blockage.",
    requiresEmergencyVisit: false,
    alternatives: ["carrots", "apple-slices", "blueberries"],
    sources: [
      { name: "ASPCA", url: "https://www.aspca.org/pet-care/animal-poison-control" },
      { name: "American Kennel Club", url: "https://www.akc.org/" },
    ],
    body: `Pecans are not as toxic as macadamia nuts, but they are high in fat and can cause pancreatitis or gastrointestinal upset. Moldy pecans can also contain tremorgenic mycotoxins.

Cats should avoid pecans because they are high in fat and hard to digest. Stick to safer treats.`,
  },
  {
    id: "pistachios",
    name: "Pistachios",
    slug: "pistachios",
    aliases: [],
    categories: ["nuts"],
    tags: ["high-fat", "salt", "shell-risk"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary: "Plain, shelled pistachios are not toxic but high in fat.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Small amounts may be tolerated, but not recommended.",
    },
    preparationNotes:
      "Use plain, unsalted, shelled pistachios. Avoid salted or flavored pistachios.",
    safeAmount: "One or two shelled pistachios rarely.",
    frequency: "Rarely.",
    symptoms: [
      "vomiting",
      "diarrhea",
      "pancreatitis",
      "choking",
      "intestinal-blockage",
    ],
    whatToDo:
      "Contact your vet if shells were swallowed or if symptoms occur.",
    requiresEmergencyVisit: false,
    alternatives: ["carrots", "green-beans", "peanut-butter"],
    sources: [
      { name: "ASPCA", url: "https://www.aspca.org/pet-care/animal-poison-control" },
      { name: "American Kennel Club", url: "https://www.akc.org/" },
    ],
    body: `Plain pistachios are not toxic to dogs, but the shells can cause choking or intestinal blockage. Salted pistachios can contribute to sodium toxicity and should be avoided.

Cats should only have a tiny taste, if any. High fat makes pistachios a poor regular treat.`,
  },
  {
    id: "macadamia-nuts",
    name: "Macadamia Nuts",
    slug: "macadamia-nuts",
    aliases: ["macadamia"],
    categories: ["nuts"],
    tags: ["toxic", "neurotoxic"],
    safetyDogs: {
      status: "toxic",
      severity: "moderate",
      summary:
        "Toxic to dogs; can cause weakness, vomiting, and hyperthermia.",
    },
    safetyCats: {
      status: "toxic",
      severity: "low",
      summary: "Limited data; avoid as a precaution.",
    },
    symptoms: [
      "weakness",
      "vomiting",
      "hyperthermia",
      "tremors",
      "lethargy",
    ],
    symptomsSeverity: [
      { symptom: "weakness", severity: "moderate" },
      { symptom: "hyperthermia", severity: "moderate" },
    ],
    whatToDo:
      "Contact your veterinarian or poison control. Most dogs recover with supportive care, but prompt treatment is important.",
    requiresEmergencyVisit: true,
    alternatives: ["peanut-butter", "carrots", "blueberries"],
    relatedFoods: ["mixed-nuts"],
    sources: [
      {
        name: "ASPCA",
        url: "https://www.aspca.org/pet-care/animal-poison-control",
      },
      {
        name: "Pet Poison Helpline",
        url: "https://www.petpoisonhelpline.com/",
      },
    ],
    body: `Macadamia nuts are known to be toxic to dogs, causing weakness, vomiting, tremors, and elevated body temperature. The exact toxic mechanism is unknown, but symptoms usually appear within 12 hours.

Most dogs recover within 24 to 48 hours with veterinary supportive care. Cats are rarely reported to eat macadamia nuts, but they should be avoided as a precaution.`,
  },
  {
    id: "hazelnuts",
    name: "Hazelnuts",
    slug: "hazelnuts",
    aliases: ["filberts"],
    categories: ["nuts"],
    tags: ["high-fat", "choking-risk"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary: "Not toxic, but can cause choking and stomach upset.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Not recommended; can cause digestive upset.",
    },
    preparationNotes:
      "Plain, unsalted hazelnuts only. Avoid chocolate-covered products.",
    safeAmount: "One small hazelnut for large dogs; avoid for small dogs.",
    frequency: "Rarely.",
    symptoms: ["choking", "intestinal-blockage", "vomiting", "diarrhea"],
    whatToDo:
      "Contact your vet if your pet choked or shows signs of blockage.",
    requiresEmergencyVisit: false,
    alternatives: ["carrots", "apple-slices", "blueberries"],
    sources: [
      { name: "ASPCA", url: "https://www.aspca.org/pet-care/animal-poison-control" },
      { name: "American Kennel Club", url: "https://www.akc.org/" },
    ],
    body: `Hazelnuts are not toxic to dogs, but whole nuts can be a choking hazard, especially for small breeds. Their high fat content can also cause stomach upset or pancreatitis.

Cats should not rely on nuts for nutrition. Offer small, safer treats instead.`,
  },
  {
    id: "sunflower-seeds",
    name: "Sunflower Seeds",
    slug: "sunflower-seeds",
    aliases: ["sunflower-kernels"],
    categories: ["nuts"],
    tags: ["safe", "seed"],
    safetyDogs: {
      status: "safe",
      severity: "low",
      summary: "Plain, shelled sunflower seeds are safe in small amounts.",
    },
    safetyCats: {
      status: "safe",
      severity: "low",
      summary: "Safe in tiny amounts.",
    },
    preparationNotes:
      "Use plain, unsalted, shelled seeds. Avoid flavored or salted seeds.",
    safeAmount: "A small pinch for small dogs; a teaspoon for large dogs.",
    frequency: "Occasional treat.",
    symptoms: ["upset-stomach", "diarrhea", "sodium-toxicity (salted)"],
    whatToDo: "Reduce amount or stop feeding if digestive upset occurs.",
    requiresEmergencyVisit: false,
    alternatives: ["pumpkin-seeds", "carrots", "green-beans"],
    sources: [{ name: "American Kennel Club", url: "https://www.akc.org/" }],
    body: `Shelled, plain sunflower seeds are safe for dogs in small amounts. They provide healthy fats and vitamin E. Salted or flavored seeds should be avoided.

Cats can have a few seeds occasionally, but they do not need them in their diet.`,
  },
  {
    id: "pumpkin-seeds",
    name: "Pumpkin Seeds",
    slug: "pumpkin-seeds",
    aliases: ["pepitas"],
    categories: ["nuts"],
    tags: ["safe", "seed"],
    safetyDogs: {
      status: "safe",
      severity: "low",
      summary: "Plain roasted pumpkin seeds are safe and nutritious.",
    },
    safetyCats: {
      status: "safe",
      severity: "low",
      summary: "Safe in small amounts.",
    },
    preparationNotes:
      "Use plain, roasted, unsalted seeds. Remove shells if tough.",
    safeAmount:
      "A few seeds for small dogs; up to a tablespoon for large dogs.",
    frequency: "Occasional treat.",
    dosagePerWeight: "About 1 teaspoon per 10 pounds of body weight.",
    symptoms: ["upset-stomach", "diarrhea"],
    whatToDo: "Reduce portion if digestive upset occurs.",
    requiresEmergencyVisit: false,
    alternatives: ["carrots", "sweet-potato", "pumpkin"],
    sources: [
      {
        name: "American Kennel Club",
        url: "https://www.akc.org/expert-advice/nutrition/can-dogs-eat-pumpkin/",
      },
      { name: "ASPCA", url: "https://www.aspca.org/pet-care/animal-poison-control" },
    ],
    body: `Plain roasted pumpkin seeds are generally safe for dogs and can be a crunchy source of fiber and minerals. Avoid salted or seasoned seeds.

Cats can also have a small amount of plain pumpkin seeds. They are not a necessary part of the diet but can be an occasional snack.`,
  },
  {
    id: "chia-seeds",
    name: "Chia Seeds",
    slug: "chia-seeds",
    aliases: [],
    categories: ["nuts"],
    tags: ["safe", "seed", "fiber"],
    safetyDogs: {
      status: "safe",
      severity: "low",
      summary:
        "Safe in small amounts when soaked or mixed into food.",
    },
    safetyCats: {
      status: "safe",
      severity: "low",
      summary: "Safe in tiny amounts.",
    },
    preparationNotes:
      "Soak seeds before feeding to avoid expansion in the stomach. Use plain chia.",
    safeAmount: "1/4 teaspoon for small dogs; up to 1 teaspoon for large dogs.",
    frequency: "Occasional.",
    dosagePerWeight: "Start with 1/8 teaspoon per 10 pounds.",
    symptoms: ["upset-stomach", "bloating", "diarrhea"],
    whatToDo:
      "Ensure seeds are soaked and reduce amount if bloating occurs.",
    requiresEmergencyVisit: false,
    alternatives: ["flax-seeds", "pumpkin", "plain-yogurt"],
    sources: [{ name: "American Kennel Club", url: "https://www.akc.org/" }],
    body: `Chia seeds are safe for dogs in small amounts and provide fiber and omega-3 fatty acids. They should be soaked before feeding to prevent them from expanding in the stomach.

Cats can have a tiny amount mixed into food. Monitor for any digestive changes.`,
  },
  {
    id: "flax-seeds",
    name: "Flax Seeds",
    slug: "flax-seeds",
    aliases: ["flaxseed", "linseed"],
    categories: ["nuts"],
    tags: ["safe", "seed", "omega-3"],
    safetyDogs: {
      status: "safe",
      severity: "low",
      summary:
        "Ground flax seeds are safe and provide fiber and fatty acids.",
    },
    safetyCats: {
      status: "safe",
      severity: "low",
      summary: "Safe in very small amounts.",
    },
    preparationNotes:
      "Use ground flaxseed or soak whole seeds. Store in the refrigerator.",
    safeAmount: "1/2 teaspoon for small dogs; 1 tablespoon for large dogs.",
    frequency: "Occasional supplement.",
    dosagePerWeight: "About 1/4 teaspoon per 10 pounds.",
    symptoms: ["diarrhea", "bloating"],
    whatToDo: "Reduce amount or stop if digestive upset occurs.",
    requiresEmergencyVisit: false,
    alternatives: ["chia-seeds", "cooked-salmon"],
    sources: [{ name: "American Kennel Club", url: "https://www.akc.org/" }],
    body: `Ground flaxseed is a safe source of fiber and omega-3 fatty acids for dogs. Whole flax seeds may pass through undigested, so grinding improves absorption.

Cats can have a very small amount of ground flaxseed occasionally. Keep the amount low to avoid loose stools.`,
  },
  {
    id: "sesame-seeds",
    name: "Sesame Seeds",
    slug: "sesame-seeds",
    aliases: [],
    categories: ["nuts"],
    tags: ["safe", "seed"],
    safetyDogs: {
      status: "safe",
      severity: "low",
      summary: "Plain sesame seeds are safe in small amounts.",
    },
    safetyCats: {
      status: "safe",
      severity: "low",
      summary: "Safe in tiny amounts.",
    },
    preparationNotes:
      "Use plain, unseasoned sesame seeds. Avoid tahini with garlic or sugar.",
    safeAmount: "A small pinch for small dogs; 1/2 teaspoon for large dogs.",
    frequency: "Occasional.",
    symptoms: ["upset-stomach", "diarrhea"],
    whatToDo: "Reduce amount if digestive upset occurs.",
    requiresEmergencyVisit: false,
    alternatives: ["pumpkin-seeds", "carrots"],
    sources: [
      { name: "ASPCA", url: "https://www.aspca.org/pet-care/animal-poison-control" },
      { name: "American Kennel Club", url: "https://www.akc.org/" },
    ],
    body: `Plain sesame seeds are generally safe for dogs in very small amounts. They add a little crunch and healthy fat but are not a dietary necessity.

Tahini and sesame-based products may contain added salt, sugar, or garlic, which should be avoided. Cats should only have a trace amount.`,
  },
  {
    id: "hemp-seeds",
    name: "Hemp Seeds",
    slug: "hemp-seeds",
    aliases: ["hemp-hearts"],
    categories: ["nuts"],
    tags: ["safe", "seed", "omega-3"],
    safetyDogs: {
      status: "safe",
      severity: "low",
      summary: "Plain hemp seeds are safe and nutritious in small amounts.",
    },
    safetyCats: {
      status: "safe",
      severity: "low",
      summary: "Safe in tiny amounts.",
    },
    preparationNotes: "Use plain, shelled hemp seeds. No seasonings.",
    safeAmount: "1/4 teaspoon for small dogs; 1 teaspoon for large dogs.",
    frequency: "Occasional.",
    symptoms: ["upset-stomach", "diarrhea"],
    whatToDo: "Reduce amount if loose stools occur.",
    requiresEmergencyVisit: false,
    alternatives: ["flax-seeds", "chia-seeds", "cooked-salmon"],
    sources: [{ name: "American Kennel Club", url: "https://www.akc.org/" }],
    body: `Hemp seeds, also called hemp hearts, are safe for dogs in small amounts. They contain protein, fiber, and omega fatty acids. Avoid seasoned or flavored hemp products.

Cats can have a very small amount. Hemp seeds should not replace balanced cat food.`,
  },
  {
    id: "pine-nuts",
    name: "Pine Nuts",
    slug: "pine-nuts",
    aliases: ["pignoli"],
    categories: ["nuts"],
    tags: ["high-fat"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary: "Safe in very small amounts; high fat.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Not recommended; small amounts may be tolerated.",
    },
    preparationNotes:
      "Plain, unsalted pine nuts only. Avoid pesto with garlic.",
    safeAmount: "A few pine nuts occasionally.",
    frequency: "Rarely.",
    symptoms: ["upset-stomach", "vomiting", "diarrhea", "pancreatitis"],
    whatToDo:
      "Stop feeding and monitor. Contact your vet if symptoms persist.",
    requiresEmergencyVisit: false,
    alternatives: ["peanut-butter", "carrots"],
    sources: [
      { name: "ASPCA", url: "https://www.aspca.org/pet-care/animal-poison-control" },
      { name: "American Kennel Club", url: "https://www.akc.org/" },
    ],
    body: `Pine nuts are not toxic to dogs, but they are high in fat and can cause stomach upset if fed in large amounts. Pesto containing pine nuts usually has garlic and other unsafe ingredients and should be avoided.

Cats should only have a tiny taste. Pine nuts are not a necessary part of feline nutrition.`,
  },
  {
    id: "brazil-nuts",
    name: "Brazil Nuts",
    slug: "brazil-nuts",
    aliases: [],
    categories: ["nuts"],
    tags: ["high-fat", "selenium"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary: "Not toxic, but very high in fat and selenium.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Not recommended; high fat and selenium.",
    },
    preparationNotes: "Plain, unsalted brazil nuts only. Avoid regularly.",
    safeAmount: "Avoid feeding; one small piece very rarely.",
    frequency: "Avoid.",
    symptoms: ["upset-stomach", "vomiting", "diarrhea", "pancreatitis"],
    whatToDo: "Contact your vet if a large amount was eaten.",
    requiresEmergencyVisit: false,
    alternatives: ["carrots", "apple-slices", "blueberries"],
    sources: [
      { name: "ASPCA", url: "https://www.aspca.org/pet-care/animal-poison-control" },
      { name: "American Kennel Club", url: "https://www.akc.org/" },
    ],
    body: `Brazil nuts are not toxic to dogs, but they are extremely high in fat and contain a lot of selenium. Regular feeding can lead to obesity and pancreatitis.

Cats should avoid brazil nuts because they are high in fat and not species-appropriate. Safer treats are available.`,
  },
  {
    id: "chestnuts",
    name: "Chestnuts",
    slug: "chestnuts",
    aliases: ["roasted-chestnuts"],
    categories: ["nuts"],
    tags: ["starch"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary: "Plain cooked chestnuts are safe in small amounts.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Small amounts of plain cooked chestnut may be tolerated.",
    },
    preparationNotes:
      "Peel and cook plain. Avoid salted, sweetened, or spiced chestnuts.",
    safeAmount: "A small piece for small dogs; one or two for large dogs.",
    frequency: "Occasional seasonal treat.",
    symptoms: ["upset-stomach", "gas", "diarrhea"],
    whatToDo:
      "Reduce portion or stop feeding if digestive upset occurs.",
    requiresEmergencyVisit: false,
    alternatives: ["sweet-potato", "carrots", "pumpkin"],
    sources: [{ name: "American Kennel Club", url: "https://www.akc.org/" }],
    body: `Plain, cooked chestnuts are lower in fat than many other nuts and can be an occasional treat for dogs. Raw chestnuts and chestnuts with shells should be avoided.

Cats may have a tiny taste, but chestnuts are not nutritionally necessary. Avoid sweetened holiday chestnut products.`,
  },
  {
    id: "coconut",
    name: "Coconut",
    slug: "coconut",
    aliases: ["coconut-flesh", "coconut-oil"],
    categories: ["nuts", "fruits"],
    tags: ["high-fat"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary:
        "Small amounts of fresh coconut flesh or oil are usually tolerated.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Small amounts may be tolerated.",
    },
    preparationNotes:
      "Use fresh, unsweetened coconut flesh or unrefined oil. Avoid sweetened coconut products.",
    safeAmount: "A small piece of flesh or 1/4 teaspoon oil for dogs.",
    frequency: "Occasional.",
    symptoms: ["diarrhea", "upset-stomach", "greasy-stools"],
    whatToDo: "Reduce amount or stop feeding if digestive upset occurs.",
    requiresEmergencyVisit: false,
    alternatives: ["blueberries", "bananas", "cucumber"],
    sources: [
      { name: "American Kennel Club", url: "https://www.akc.org/" },
    ],
    body: `Fresh, unsweetened coconut flesh and small amounts of coconut oil are generally safe for dogs. Some dogs experience diarrhea or greasy stools from the high fat content.

Cats can have a tiny amount of coconut flesh occasionally. Sweetened coconut used in baking should be avoided.`,
  },
  {
    id: "peanut-butter",
    name: "Peanut Butter",
    slug: "peanut-butter",
    aliases: ["peanut butter"],
    categories: ["nuts"],
    tags: ["treat", "high-fat"],
    safetyDogs: {
      status: "safe",
      severity: "low",
      summary: "Safe when free of xylitol and low in salt.",
    },
    safetyCats: {
      status: "safe",
      severity: "low",
      summary: "Safe in tiny amounts xylitol-free.",
    },
    preparationNotes:
      "Choose natural peanut butter with no xylitol, salt, or added sugar.",
    safeAmount: "A small lick or teaspoon for dogs.",
    frequency: "Occasional high-value treat.",
    symptoms: [
      "hypoglycemia",
      "liver-failure (if xylitol present)",
      "upset-stomach",
    ],
    whatToDo:
      "If xylitol-containing peanut butter was eaten, seek emergency care immediately.",
    requiresEmergencyVisit: false,
    alternatives: ["pumpkin", "plain-yogurt", "carrots"],
    sources: [
      { name: "American Kennel Club", url: "https://www.akc.org/" },
    ],
    notesForPuppies: "Use as a training treat in small amounts.",
    notesForKittens: "Offer only a tiny lick.",
    body: `Plain peanut butter without xylitol is a popular and generally safe treat for dogs. It can be used for hiding pills or as a training reward. Always read the label carefully for xylitol.

Cats can have a very small taste, but peanut butter is high in fat and not a natural part of their diet.`,
  },
  {
    id: "almond-butter",
    name: "Almond Butter",
    slug: "almond-butter",
    aliases: [],
    categories: ["nuts"],
    tags: ["high-fat"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary: "Safe in very small amounts; high in fat.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Small amounts may be tolerated.",
    },
    preparationNotes:
      "Choose plain, unsalted almond butter with no xylitol or added sugar.",
    safeAmount: "A small lick or 1/4 teaspoon for dogs.",
    frequency: "Rarely.",
    symptoms: ["upset-stomach", "vomiting", "diarrhea", "pancreatitis"],
    whatToDo:
      "Stop feeding and monitor. Contact your vet if symptoms persist.",
    requiresEmergencyVisit: false,
    alternatives: ["peanut-butter", "pumpkin", "carrots"],
    sources: [{ name: "American Kennel Club", url: "https://www.akc.org/" }],
    body: `Almond butter is not toxic to dogs, but it is high in fat and calories. A small lick occasionally is usually fine. Avoid products with xylitol, salt, or chocolate.

Cats do not need almond butter. Offer safer treats such as cooked chicken or a small piece of fruit.`,
  },
  {
    id: "cashew-butter",
    name: "Cashew Butter",
    slug: "cashew-butter",
    aliases: [],
    categories: ["nuts"],
    tags: ["high-fat"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary: "Plain cashew butter is safe in small amounts.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Small amounts may be tolerated.",
    },
    preparationNotes:
      "Choose plain, unsalted cashew butter with no xylitol or added sugar.",
    safeAmount: "A small lick for dogs.",
    frequency: "Rarely.",
    symptoms: ["upset-stomach", "vomiting", "diarrhea", "pancreatitis"],
    whatToDo:
      "Reduce amount or stop feeding if digestive upset occurs.",
    requiresEmergencyVisit: false,
    alternatives: ["peanut-butter", "pumpkin", "carrots"],
    sources: [{ name: "American Kennel Club", url: "https://www.akc.org/" }],
    body: `Plain cashew butter is generally safe for dogs in very small amounts. It is calorie-dense, so use it sparingly. Check the label for xylitol and other unsafe additives.

Cats can have a tiny taste, but nuts are not a natural part of their diet.`,
  },
  {
    id: "walnut-butter",
    name: "Walnut Butter",
    slug: "walnut-butter",
    aliases: [],
    categories: ["nuts"],
    tags: ["high-fat", "mold-risk"],
    safetyDogs: {
      status: "limited",
      severity: "moderate",
      summary: "Not recommended due to fat and possible mold toxins.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Not recommended.",
    },
    preparationNotes:
      "Avoid walnut butter. If offered, ensure it is fresh, plain, and free of mold.",
    safeAmount: "Avoid feeding.",
    frequency: "Avoid.",
    symptoms: ["upset-stomach", "vomiting", "diarrhea", "tremors"],
    whatToDo: "Contact your vet if moldy or large amounts were eaten.",
    requiresEmergencyVisit: false,
    alternatives: ["peanut-butter", "almond-butter", "carrots"],
    sources: [
      {
        name: "Pet Poison Helpline",
        url: "https://www.petpoisonhelpline.com/",
      },
    ],
    body: `Walnut butter is not a recommended treat for dogs. Walnuts can harbor mold that produces toxins causing neurological signs, and the butter is high in fat.

Cats should avoid walnut butter. Safer nut butters include peanut butter or almond butter in small amounts.`,
  },
  {
    id: "mixed-nuts",
    name: "Mixed Nuts",
    slug: "mixed-nuts",
    aliases: ["trail-mix"],
    categories: ["nuts"],
    tags: ["high-fat", "salt", "toxic-risk"],
    safetyDogs: {
      status: "limited",
      severity: "moderate",
      summary:
        "Avoid; often contains salt, chocolate, raisins, or macadamia nuts.",
    },
    safetyCats: {
      status: "limited",
      severity: "moderate",
      summary: "Avoid due to salt, fat, and possible toxic ingredients.",
    },
    preparationNotes:
      "Do not feed mixed nuts or trail mix. If given, ensure only plain, unsalted, pet-safe nuts.",
    safeAmount: "Avoid.",
    frequency: "Avoid.",
    symptoms: [
      "vomiting",
      "diarrhea",
      "pancreatitis",
      "salt-toxicity",
      "weakness",
    ],
    whatToDo:
      "Contact your vet or poison control if the mix contained chocolate, raisins, xylitol, or macadamia nuts.",
    requiresEmergencyVisit: false,
    alternatives: ["carrots", "apple-slices", "blueberries"],
    sources: [
      { name: "ASPCA", url: "https://www.aspca.org/pet-care/animal-poison-control" },
      {
        name: "Pet Poison Helpline",
        url: "https://www.petpoisonhelpline.com/",
      },
    ],
    body: `Mixed nuts and trail mix often contain dangerous ingredients such as chocolate-covered raisins, macadamia nuts, salt, and seasonings. Even plain mixed nuts are too high in fat for pets.

It is safest to avoid sharing mixed nuts entirely and choose single-ingredient, pet-safe treats instead.`,
  },
  {
    id: "salted-nuts",
    name: "Salted Nuts",
    slug: "salted-nuts",
    aliases: ["salted-peanuts", "salted-cashews"],
    categories: ["nuts"],
    tags: ["high-sodium", "high-fat"],
    safetyDogs: {
      status: "limited",
      severity: "moderate",
      summary: "High sodium and fat make salted nuts a poor choice.",
    },
    safetyCats: {
      status: "limited",
      severity: "moderate",
      summary: "High sodium can be dangerous for cats.",
    },
    preparationNotes:
      "Avoid salted nuts. If nuts are given, choose plain, unsalted varieties.",
    safeAmount: "Avoid.",
    frequency: "Avoid.",
    symptoms: [
      "excessive-thirst",
      "vomiting",
      "diarrhea",
      "tremors",
      "seizures (salt toxicity)",
    ],
    whatToDo:
      "Contact your vet if your pet ate a large amount of salted nuts or shows neurological signs.",
    requiresEmergencyVisit: false,
    alternatives: ["plain-peanuts", "carrots", "green-beans"],
    sources: [
      { name: "ASPCA", url: "https://www.aspca.org/pet-care/animal-poison-control" },
      {
        name: "Pet Poison Helpline",
        url: "https://www.petpoisonhelpline.com/",
      },
    ],
    body: `Salted nuts contain too much sodium for dogs and cats. Large amounts can lead to salt toxicity, causing vomiting, tremors, seizures, and even death.

Choose plain, unsalted nuts or, better yet, skip nuts altogether and offer vegetables or fruit.`,
  },
]

export const sweets: FoodData[] = [
  {
    id: "chocolate",
    name: "Chocolate",
    slug: "chocolate",
    aliases: ["cocoa"],
    categories: ["sweets", "human-foods"],
    tags: ["theobromine", "toxic"],
    safetyDogs: {
      status: "toxic",
      severity: "high",
      summary:
        "Toxic. Theobromine and caffeine can cause serious illness.",
    },
    safetyCats: {
      status: "toxic",
      severity: "high",
      summary:
        "Toxic. Theobromine and caffeine can cause serious illness.",
    },
    symptoms: [
      "vomiting",
      "diarrhea",
      "restlessness",
      "rapid-breathing",
      "muscle-tremors",
      "seizures",
    ],
    symptomsSeverity: [
      { symptom: "seizures", severity: "critical" },
      { symptom: "muscle-tremors", severity: "high" },
    ],
    whatToDo:
      "Contact your vet or poison control immediately. Bring the wrapper and note the type and amount eaten.",
    requiresEmergencyVisit: true,
    alternatives: ["carob", "blueberries", "apple-slices"],
    relatedFoods: [
      "dark-chocolate",
      "milk-chocolate",
      "brownies",
      "chocolate-chip-cookies",
    ],
    sources: [
      {
        name: "ASPCA",
        url: "https://www.aspca.org/pet-care/animal-poison-control",
      },
      {
        name: "Pet Poison Helpline",
        url: "https://www.petpoisonhelpline.com/",
      },
    ],
    body: `Chocolate contains theobromine and caffeine, both of which are toxic to dogs and cats. Dark chocolate, baking chocolate, and cocoa powder contain the highest levels and are the most dangerous.

Even small amounts of milk chocolate can cause vomiting and diarrhea, while larger amounts can lead to seizures and heart problems. Contact a veterinarian immediately if your pet eats chocolate.`,
  },
  {
    id: "dark-chocolate",
    name: "Dark Chocolate",
    slug: "dark-chocolate",
    aliases: ["baking-chocolate", "bittersweet-chocolate"],
    categories: ["sweets", "human-foods"],
    tags: ["theobromine", "toxic"],
    safetyDogs: {
      status: "toxic",
      severity: "critical",
      summary: "Very toxic due to high theobromine content.",
    },
    safetyCats: {
      status: "toxic",
      severity: "critical",
      summary: "Very toxic due to high theobromine content.",
    },
    symptoms: [
      "vomiting",
      "diarrhea",
      "restlessness",
      "rapid-heart-rate",
      "muscle-tremors",
      "seizures",
      "collapse",
    ],
    symptomsSeverity: [
      { symptom: "seizures", severity: "critical" },
      { symptom: "collapse", severity: "critical" },
    ],
    whatToDo:
      "Seek emergency veterinary care immediately. Dark chocolate is more dangerous than milk chocolate.",
    requiresEmergencyVisit: true,
    alternatives: ["carob", "blueberries"],
    relatedFoods: ["chocolate", "milk-chocolate"],
    sources: [
      {
        name: "ASPCA",
        url: "https://www.aspca.org/pet-care/animal-poison-control",
      },
      {
        name: "Pet Poison Helpline",
        url: "https://www.petpoisonhelpline.com/",
      },
    ],
    body: `Dark chocolate and baking chocolate contain the highest concentrations of theobromine and caffeine. Ingestion can quickly lead to serious cardiac and neurological symptoms in pets.

Because even a small amount can be life-threatening, immediate veterinary attention is critical. Do not wait for symptoms to appear.`,
  },
  {
    id: "milk-chocolate",
    name: "Milk Chocolate",
    slug: "milk-chocolate",
    aliases: [],
    categories: ["sweets", "human-foods"],
    tags: ["theobromine", "toxic"],
    safetyDogs: {
      status: "toxic",
      severity: "high",
      summary:
        "Toxic. Lower theobromine than dark chocolate but still dangerous.",
    },
    safetyCats: {
      status: "toxic",
      severity: "high",
      summary: "Toxic. Can cause vomiting, tremors, and seizures.",
    },
    symptoms: [
      "vomiting",
      "diarrhea",
      "restlessness",
      "rapid-breathing",
      "muscle-tremors",
      "seizures",
    ],
    symptomsSeverity: [
      { symptom: "seizures", severity: "critical" },
      { symptom: "muscle-tremors", severity: "high" },
    ],
    whatToDo:
      "Contact your vet or poison control immediately, especially if a large amount was eaten.",
    requiresEmergencyVisit: true,
    alternatives: ["carob", "blueberries", "apple-slices"],
    relatedFoods: ["chocolate", "dark-chocolate"],
    sources: [
      {
        name: "ASPCA",
        url: "https://www.aspca.org/pet-care/animal-poison-control",
      },
      {
        name: "Pet Poison Helpline",
        url: "https://www.petpoisonhelpline.com/",
      },
    ],
    body: `Milk chocolate contains less theobromine than dark chocolate, but it is still toxic to dogs and cats. The risk depends on the amount eaten and the size of the pet.

Symptoms can range from mild vomiting and diarrhea to tremors and seizures. Contact a veterinarian for guidance after any ingestion.`,
  },
  {
    id: "white-chocolate",
    name: "White Chocolate",
    slug: "white-chocolate",
    aliases: [],
    categories: ["sweets", "human-foods"],
    tags: ["low-theobromine", "high-fat"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary:
        "Low theobromine, but high fat and sugar can cause stomach upset.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "High fat and sugar make it a poor treat.",
    },
    preparationNotes:
      "Avoid feeding. If offered accidentally, ensure no xylitol or other toxic ingredients.",
    safeAmount:
      "A tiny amount accidentally is unlikely to cause theobromine toxicity.",
    frequency: "Avoid.",
    symptoms: [
      "upset-stomach",
      "vomiting",
      "diarrhea",
      "pancreatitis",
      "weight-gain",
    ],
    whatToDo:
      "Monitor your pet. Contact your vet if a large amount was eaten or symptoms occur.",
    requiresEmergencyVisit: false,
    alternatives: ["carob", "blueberries"],
    relatedFoods: ["chocolate", "dark-chocolate"],
    sources: [
      {
        name: "ASPCA",
        url: "https://www.aspca.org/pet-care/animal-poison-control",
      },
    ],
    body: `White chocolate contains very little theobromine and is unlikely to cause chocolate toxicity. However, it is high in fat and sugar, which can lead to pancreatitis and digestive upset.

It may also contain xylitol or other ingredients that are toxic. It is best to avoid giving white chocolate to pets.`,
  },
  {
    id: "chocolate-chip-cookies",
    name: "Chocolate Chip Cookies",
    slug: "chocolate-chip-cookies",
    aliases: ["cookies with chocolate"],
    categories: ["sweets", "human-foods"],
    tags: ["theobromine", "toxic", "high-sugar"],
    safetyDogs: {
      status: "toxic",
      severity: "high",
      summary: "Chocolate content makes these cookies dangerous.",
    },
    safetyCats: {
      status: "toxic",
      severity: "high",
      summary: "Chocolate and high fat make these unsafe.",
    },
    symptoms: [
      "vomiting",
      "diarrhea",
      "restlessness",
      "rapid-breathing",
      "muscle-tremors",
      "seizures",
    ],
    symptomsSeverity: [{ symptom: "seizures", severity: "critical" }],
    whatToDo:
      "Contact your vet or poison control. Note the amount and type of chocolate in the cookies.",
    requiresEmergencyVisit: true,
    alternatives: ["plain-cookies", "carob-dog-treats", "blueberries"],
    relatedFoods: ["chocolate", "brownies"],
    sources: [
      {
        name: "ASPCA",
        url: "https://www.aspca.org/pet-care/animal-poison-control",
      },
      {
        name: "Pet Poison Helpline",
        url: "https://www.petpoisonhelpline.com/",
      },
    ],
    body: `Chocolate chip cookies contain chocolate, which is toxic to pets. The cookie dough and butter can add extra fat and sugar, increasing the risk of pancreatitis.

If your pet eats chocolate chip cookies, contact a veterinarian immediately. The darker the chocolate, the greater the danger.`,
  },
  {
    id: "brownies",
    name: "Brownies",
    slug: "brownies",
    aliases: ["chocolate-brownies"],
    categories: ["sweets", "human-foods"],
    tags: ["theobromine", "toxic", "high-fat"],
    safetyDogs: {
      status: "toxic",
      severity: "high",
      summary: "Chocolate and high fat make brownies dangerous.",
    },
    safetyCats: {
      status: "toxic",
      severity: "high",
      summary: "Chocolate and rich ingredients are unsafe.",
    },
    symptoms: [
      "vomiting",
      "diarrhea",
      "restlessness",
      "rapid-breathing",
      "muscle-tremors",
      "seizures",
      "pancreatitis",
    ],
    symptomsSeverity: [
      { symptom: "seizures", severity: "critical" },
      { symptom: "pancreatitis", severity: "high" },
    ],
    whatToDo:
      "Seek veterinary advice immediately after ingestion. Note the chocolate type and amount.",
    requiresEmergencyVisit: true,
    alternatives: ["carob-brownies-for-dogs", "blueberries", "plain-yogurt"],
    relatedFoods: ["chocolate", "chocolate-chip-cookies"],
    sources: [
      {
        name: "ASPCA",
        url: "https://www.aspca.org/pet-care/animal-poison-control",
      },
      {
        name: "Pet Poison Helpline",
        url: "https://www.petpoisonhelpline.com/",
      },
    ],
    body: `Brownies usually contain chocolate, butter, sugar, and sometimes nuts or xylitol, all of which can be dangerous to pets. Chocolate toxicity is the primary concern.

Even brownies made with cocoa powder can deliver a significant dose of theobromine. Contact your vet or a poison helpline immediately if your pet eats brownies.`,
  },
  {
    id: "chocolate-syrup",
    name: "Chocolate Syrup",
    slug: "chocolate-syrup",
    aliases: ["cocoa-syrup", "chocolate-sauce"],
    categories: ["sweets", "human-foods"],
    tags: ["theobromine", "liquid-sugar"],
    safetyDogs: {
      status: "toxic",
      severity: "high",
      summary: "Contains theobromine and large amounts of sugar.",
    },
    safetyCats: {
      status: "toxic",
      severity: "high",
      summary: "Contains theobromine and sugar.",
    },
    symptoms: [
      "vomiting",
      "diarrhea",
      "restlessness",
      "rapid-breathing",
      "muscle-tremors",
      "seizures",
    ],
    whatToDo:
      "Contact your vet or poison control immediately. Bring the bottle to estimate concentration.",
    requiresEmergencyVisit: true,
    alternatives: ["carob-sauce", "blueberries"],
    relatedFoods: ["chocolate", "milk-chocolate"],
    sources: [
      {
        name: "ASPCA",
        url: "https://www.aspca.org/pet-care/animal-poison-control",
      },
      {
        name: "Pet Poison Helpline",
        url: "https://www.petpoisonhelpline.com/",
      },
    ],
    body: `Chocolate syrup contains cocoa and a large amount of sugar. It can cause chocolate toxicity and digestive upset in dogs and cats. Sugar-free syrups may also contain xylitol, which is even more dangerous.

Keep all chocolate sauces away from pets and seek veterinary help immediately if ingestion occurs.`,
  },
  {
    id: "cake",
    name: "Cake",
    slug: "cake",
    aliases: ["birthday-cake"],
    categories: ["sweets", "human-foods"],
    tags: ["high-sugar", "high-fat"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary:
        "Plain cake without toxic ingredients is not toxic but unhealthy.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "High sugar and fat make cake a poor choice.",
    },
    preparationNotes:
      "Avoid feeding cake. Chocolate, xylitol, raisins, and alcohol are common toxic ingredients.",
    safeAmount: "A tiny crumb accidentally is unlikely to harm.",
    frequency: "Avoid.",
    symptoms: [
      "upset-stomach",
      "vomiting",
      "diarrhea",
      "weight-gain",
      "pancreatitis",
    ],
    whatToDo:
      "Monitor your pet. Contact your vet if the cake contained chocolate, raisins, xylitol, or alcohol.",
    requiresEmergencyVisit: false,
    alternatives: ["dog-safe-cake", "blueberries", "plain-yogurt"],
    sources: [{ name: "American Kennel Club", url: "https://www.akc.org/" }],
    body: `Plain cake is not toxic to pets, but it is high in sugar and fat with no nutritional benefit. Many cakes contain dangerous ingredients such as chocolate, xylitol sweetener, raisins, or alcohol.

It is best to celebrate with pet-safe treats instead of sharing human cake.`,
  },
  {
    id: "cupcakes",
    name: "Cupcakes",
    slug: "cupcakes",
    aliases: ["frosted-cupcakes"],
    categories: ["sweets", "human-foods"],
    tags: ["high-sugar", "high-fat"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary:
        "Not toxic by itself, but unhealthy and may contain toxic toppings.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "High sugar and fat make cupcakes unsuitable.",
    },
    preparationNotes:
      "Avoid sharing. Check for chocolate, xylitol, raisins, or macadamia nuts.",
    safeAmount: "Avoid feeding.",
    frequency: "Avoid.",
    symptoms: ["upset-stomach", "vomiting", "diarrhea", "weight-gain"],
    whatToDo:
      "Monitor your pet. Contact your vet if toxic ingredients were present.",
    requiresEmergencyVisit: false,
    alternatives: ["dog-safe-cupcakes", "blueberries", "plain-yogurt"],
    sources: [{ name: "American Kennel Club", url: "https://www.akc.org/" }],
    body: `Cupcakes are high in sugar and fat and offer no nutritional value to pets. Frosting, chocolate chips, sprinkles, and other decorations can contain toxic ingredients.

A pet-safe cupcake recipe or a small piece of fruit is a better choice for celebrations.`,
  },
  {
    id: "donuts",
    name: "Donuts",
    slug: "donuts",
    aliases: ["doughnuts"],
    categories: ["sweets", "human-foods"],
    tags: ["high-sugar", "high-fat", "fried"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary:
        "Not toxic, but high fat and sugar can cause pancreatitis.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Not recommended; high fat and sugar.",
    },
    preparationNotes:
      "Avoid feeding. Chocolate, xylitol, and glazed toppings add risk.",
    safeAmount: "Avoid.",
    frequency: "Avoid.",
    symptoms: [
      "upset-stomach",
      "vomiting",
      "diarrhea",
      "pancreatitis",
      "weight-gain",
    ],
    whatToDo:
      "Monitor for vomiting or diarrhea. Contact your vet if symptoms are severe.",
    requiresEmergencyVisit: false,
    alternatives: ["plain-cookies", "blueberries", "carrots"],
    sources: [{ name: "American Kennel Club", url: "https://www.akc.org/" }],
    body: `Donuts are fried and loaded with sugar and fat. They can cause digestive upset and pancreatitis in dogs and cats. Some donuts contain chocolate or other toxic ingredients.

It is best not to share donuts with pets. Offer healthier treats instead.`,
  },
  {
    id: "cookies",
    name: "Cookies",
    slug: "cookies",
    aliases: ["biscuits"],
    categories: ["sweets", "human-foods"],
    tags: ["high-sugar", "high-fat"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary: "Plain cookies are not toxic but unhealthy.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "High sugar and fat make cookies a poor treat.",
    },
    preparationNotes:
      "Avoid cookies with chocolate, raisins, macadamia nuts, or xylitol.",
    safeAmount: "A tiny plain piece very occasionally.",
    frequency: "Avoid.",
    symptoms: ["upset-stomach", "vomiting", "diarrhea", "weight-gain"],
    whatToDo:
      "Monitor. Contact your vet if toxic ingredients were present.",
    requiresEmergencyVisit: false,
    alternatives: ["dog-biscuits", "carrots", "apple-slices"],
    sources: [{ name: "American Kennel Club", url: "https://www.akc.org/" }],
    body: `Plain cookies are not poisonous to pets, but they are high in sugar and fat. Many cookies contain dangerous add-ins such as chocolate, raisins, or macadamia nuts.

Choose pet-safe biscuits or small pieces of fruit as a safer treat.`,
  },
  {
    id: "candy",
    name: "Candy",
    slug: "candy",
    aliases: ["sweets"],
    categories: ["sweets", "human-foods"],
    tags: ["high-sugar", "choking-risk"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary:
        "Plain sugary candy is not toxic but can cause stomach upset.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Not recommended due to sugar.",
    },
    preparationNotes:
      "Avoid all candy, especially sugar-free varieties that may contain xylitol.",
    safeAmount: "Avoid.",
    frequency: "Avoid.",
    symptoms: [
      "upset-stomach",
      "vomiting",
      "diarrhea",
      "weight-gain",
      "choking",
    ],
    whatToDo:
      "Contact your vet immediately if sugar-free candy or chocolate was eaten.",
    requiresEmergencyVisit: false,
    alternatives: ["blueberries", "carrots", "apple-slices"],
    sources: [
      {
        name: "ASPCA",
        url: "https://www.aspca.org/pet-care/animal-poison-control",
      },
      { name: "American Kennel Club", url: "https://www.akc.org/" },
    ],
    body: `Most sugary candy is not toxic to pets, but it is unhealthy and can cause digestive upset. Hard candies can be a choking hazard. Sugar-free candy is especially dangerous because it may contain xylitol.

Keep candy bowls out of reach and offer pet-safe treats instead.`,
  },
  {
    id: "hard-candy",
    name: "Hard Candy",
    slug: "hard-candy",
    aliases: ["lollipops", "candy-canes"],
    categories: ["sweets", "human-foods"],
    tags: ["choking-risk", "sugar"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary: "Not toxic, but poses choking and dental risks.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Choking hazard and high sugar.",
    },
    preparationNotes:
      "Avoid hard candy. Sugar-free versions may contain xylitol.",
    safeAmount: "Avoid.",
    frequency: "Avoid.",
    symptoms: ["choking", "dental-damage", "upset-stomach"],
    whatToDo:
      "Contact your vet if your pet choked or ate sugar-free hard candy.",
    requiresEmergencyVisit: false,
    alternatives: ["blueberries", "carrots"],
    sources: [
      {
        name: "ASPCA",
        url: "https://www.aspca.org/pet-care/animal-poison-control",
      },
    ],
    body: `Hard candy is not typically toxic, but it can cause choking or break teeth. Sugar-free hard candy may contain xylitol, which is extremely toxic to dogs.

Keep hard candies away from pets and offer soft, safe treats instead.`,
  },
  {
    id: "gummy-candy",
    name: "Gummy Candy",
    slug: "gummy-candy",
    aliases: ["gummy-bears", "fruit-snacks"],
    categories: ["sweets", "human-foods"],
    tags: ["sugar", "choking-risk"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary: "Not toxic, but high sugar and choking risk.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "High sugar and can stick to teeth.",
    },
    preparationNotes: "Avoid gummy candy. Some contain xylitol.",
    safeAmount: "Avoid.",
    frequency: "Avoid.",
    symptoms: ["upset-stomach", "vomiting", "diarrhea", "choking"],
    whatToDo:
      "Contact your vet if sugar-free gummies or large amounts were eaten.",
    requiresEmergencyVisit: false,
    alternatives: ["blueberries", "strawberries", "carrots"],
    sources: [
      {
        name: "ASPCA",
        url: "https://www.aspca.org/pet-care/animal-poison-control",
      },
    ],
    body: `Gummy candy is high in sugar and can be a choking hazard, especially for small pets. Some sugar-free gummies contain xylitol, which is dangerous to dogs.

It is best not to share gummy candy with pets.`,
  },
  {
    id: "marshmallows",
    name: "Marshmallows",
    slug: "marshmallows",
    aliases: ["marshmallow"],
    categories: ["sweets", "human-foods"],
    tags: ["sugar", "choking-risk"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary: "Plain marshmallows are not toxic but high in sugar.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Not recommended due to sugar.",
    },
    preparationNotes: "Avoid marshmallows with xylitol or chocolate coating.",
    safeAmount: "A tiny piece very rarely.",
    frequency: "Rarely.",
    symptoms: [
      "upset-stomach",
      "vomiting",
      "diarrhea",
      "weight-gain",
      "choking",
    ],
    whatToDo:
      "Monitor. Contact your vet if xylitol-containing marshmallows were eaten.",
    requiresEmergencyVisit: false,
    alternatives: ["plain-yogurt", "blueberries"],
    sources: [{ name: "American Kennel Club", url: "https://www.akc.org/" }],
    body: `Plain marshmallows are not toxic to dogs, but they are mostly sugar and offer no nutrition. They can also be a choking hazard, especially for small dogs.

Some marshmallows and marshmallow-containing products contain xylitol, which is extremely toxic. Always check the label.`,
  },
  {
    id: "gum",
    name: "Gum",
    slug: "gum",
    aliases: ["chewing-gum"],
    categories: ["sweets", "human-foods"],
    tags: ["xylitol", "choking-risk"],
    safetyDogs: {
      status: "toxic",
      severity: "critical",
      summary:
        "Sugar-free gum often contains xylitol, which is life-threatening.",
    },
    safetyCats: {
      status: "toxic",
      severity: "high",
      summary: "Xylitol-containing gum is dangerous.",
    },
    symptoms: [
      "vomiting",
      "weakness",
      "loss-of-coordination",
      "seizures",
      "collapse",
      "liver-failure",
    ],
    symptomsSeverity: [
      { symptom: "collapse", severity: "critical" },
      { symptom: "liver-failure", severity: "critical" },
    ],
    whatToDo:
      "Seek emergency veterinary care immediately. Bring the gum packaging.",
    requiresEmergencyVisit: true,
    alternatives: ["dental-chews", "carrots"],
    relatedFoods: ["sugar-free-gum", "xylitol"],
    sources: [
      {
        name: "Pet Poison Helpline",
        url: "https://www.petpoisonhelpline.com/",
      },
      {
        name: "ASPCA",
        url: "https://www.aspca.org/pet-care/animal-poison-control",
      },
    ],
    body: `Chewing gum is dangerous to pets primarily because sugar-free gum contains xylitol. Xylitol can cause rapid insulin release, leading to hypoglycemia, seizures, and liver failure.

Even a small amount of xylitol-containing gum can be life-threatening for a dog. Keep all gum out of reach.`,
  },
  {
    id: "sugar-free-gum",
    name: "Sugar-Free Gum",
    slug: "sugar-free-gum",
    aliases: ["xylitol-gum"],
    categories: ["sweets", "human-foods"],
    tags: ["xylitol", "critical"],
    safetyDogs: {
      status: "toxic",
      severity: "critical",
      summary: "Extremely toxic due to xylitol.",
    },
    safetyCats: {
      status: "toxic",
      severity: "critical",
      summary: "Extremely toxic due to xylitol.",
    },
    symptoms: [
      "vomiting",
      "weakness",
      "loss-of-coordination",
      "seizures",
      "collapse",
      "liver-failure",
    ],
    symptomsSeverity: [
      { symptom: "seizures", severity: "critical" },
      { symptom: "liver-failure", severity: "critical" },
    ],
    whatToDo:
      "Seek emergency veterinary care immediately. Do not wait for symptoms.",
    requiresEmergencyVisit: true,
    alternatives: ["dental-chews", "carrots"],
    relatedFoods: ["gum", "xylitol"],
    sources: [
      {
        name: "Pet Poison Helpline",
        url: "https://www.petpoisonhelpline.com/",
      },
      {
        name: "ASPCA",
        url: "https://www.aspca.org/pet-care/animal-poison-control",
      },
    ],
    body: `Sugar-free gum almost always contains xylitol, which is highly toxic to dogs and can be dangerous to cats. Ingestion can cause a rapid drop in blood sugar and liver damage.

Emergency treatment is required even if the amount seems small. Keep sugar-free gum and mints away from pets.`,
  },
  {
    id: "xylitol",
    name: "Xylitol",
    slug: "xylitol",
    aliases: ["birch-sugar", "sugar-alcohol"],
    categories: ["sweets", "human-foods"],
    tags: ["critical", "hypoglycemia"],
    safetyDogs: {
      status: "toxic",
      severity: "critical",
      summary: "Extremely toxic. Can cause hypoglycemia and liver failure.",
    },
    safetyCats: {
      status: "toxic",
      severity: "critical",
      summary: "Can cause hypoglycemia and liver damage.",
    },
    symptoms: [
      "vomiting",
      "weakness",
      "loss-of-coordination",
      "seizures",
      "collapse",
      "liver-failure",
    ],
    symptomsSeverity: [
      { symptom: "hypoglycemia", severity: "critical" },
      { symptom: "liver-failure", severity: "critical" },
    ],
    whatToDo:
      "Seek emergency veterinary care immediately. Bring the product packaging.",
    requiresEmergencyVisit: true,
    alternatives: ["blueberries", "carrots"],
    relatedFoods: ["sugar-free-gum", "gum"],
    sources: [
      {
        name: "Pet Poison Helpline",
        url: "https://www.petpoisonhelpline.com/",
      },
      {
        name: "ASPCA",
        url: "https://www.aspca.org/pet-care/animal-poison-control",
      },
    ],
    body: `Xylitol is a sugar substitute found in sugar-free gum, candy, baked goods, and some peanut butters. In dogs, it can trigger a rapid insulin release, causing severe hypoglycemia and possible liver failure.

Cats are also sensitive, and any suspected ingestion should be treated as an emergency. Always check labels for xylitol before sharing human foods.`,
  },
  {
    id: "artificial-sweeteners",
    name: "Artificial Sweeteners",
    slug: "artificial-sweeteners",
    aliases: ["sugar-substitutes", "low-calorie-sweeteners"],
    categories: ["sweets", "human-foods"],
    tags: ["sweetener"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary:
        "Most artificial sweeteners are not toxic, but xylitol is dangerous.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Generally not toxic except xylitol; not recommended.",
    },
    preparationNotes:
      "Avoid products containing xylitol. Check labels carefully.",
    safeAmount: "Avoid feeding products with artificial sweeteners.",
    frequency: "Avoid.",
    symptoms: ["upset-stomach", "diarrhea"],
    whatToDo: "Contact your vet or poison control if xylitol was ingested.",
    requiresEmergencyVisit: false,
    alternatives: ["blueberries", "apple-slices"],
    relatedFoods: ["xylitol", "sugar-free-gum"],
    sources: [
      {
        name: "ASPCA",
        url: "https://www.aspca.org/pet-care/animal-poison-control",
      },
      {
        name: "Pet Poison Helpline",
        url: "https://www.petpoisonhelpline.com/",
      },
    ],
    body: `Most artificial sweeteners such as sorbitol, erythritol, and aspartame are not considered toxic to pets. However, xylitol is highly toxic to dogs and should be avoided completely.

Because labels can be confusing, it is safest to avoid sharing sweetened human foods with pets.`,
  },
  {
    id: "sugar",
    name: "Sugar",
    slug: "sugar",
    aliases: ["granulated-sugar"],
    categories: ["sweets", "human-foods"],
    tags: ["empty-calories"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary:
        "Not toxic, but unhealthy and can cause weight gain and dental issues.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Not toxic, but not recommended.",
    },
    preparationNotes: "Avoid feeding plain sugar or sugary foods.",
    safeAmount: "Avoid.",
    frequency: "Avoid.",
    symptoms: [
      "weight-gain",
      "dental-decay",
      "upset-stomach",
      "diabetes",
    ],
    whatToDo:
      "Reduce sugary treats. Contact your vet if your pet ate a large amount.",
    requiresEmergencyVisit: false,
    alternatives: ["blueberries", "apple-slices", "carrots"],
    sources: [{ name: "American Kennel Club", url: "https://www.akc.org/" }],
    body: `Plain sugar is not toxic to pets, but it provides empty calories and can contribute to obesity, dental disease, and diabetes. Sugary foods often contain other dangerous ingredients.

Avoid giving sugar or sweets to pets. Choose natural, low-sugar treats instead.`,
  },
  {
    id: "honey",
    name: "Honey",
    slug: "honey",
    aliases: ["raw-honey"],
    categories: ["sweets"],
    tags: ["natural-sugar"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary: "Safe in very small amounts; high sugar.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Small amounts only.",
    },
    preparationNotes:
      "Use raw or pasteurized plain honey. Avoid honey with added flavors.",
    safeAmount: "A small lick or teaspoon for dogs.",
    frequency: "Rarely due to high sugar content.",
    symptoms: ["weight-gain", "upset-stomach", "blood-sugar-spike"],
    whatToDo:
      "Avoid honey for diabetic pets. Contact your vet if digestive upset occurs.",
    requiresEmergencyVisit: false,
    alternatives: ["blueberries", "apple-slices"],
    sources: [{ name: "American Kennel Club", url: "https://www.akc.org/" }],
    body: `Honey is safe for most dogs in very small amounts but is high in sugar. It should not be given to diabetic or overweight pets.

Cats can have a tiny taste, but they do not need sweets. Avoid giving honey to kittens.`,
  },
  {
    id: "maple-syrup",
    name: "Maple Syrup",
    slug: "maple-syrup",
    aliases: ["pancake-syrup"],
    categories: ["sweets", "human-foods"],
    tags: ["sugar"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary: "Not toxic, but very high in sugar.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "High sugar makes it unsuitable.",
    },
    preparationNotes:
      "Avoid maple syrup. If offered accidentally, ensure no xylitol.",
    safeAmount: "Avoid.",
    frequency: "Avoid.",
    symptoms: [
      "weight-gain",
      "upset-stomach",
      "diarrhea",
      "blood-sugar-spike",
    ],
    whatToDo:
      "Monitor your pet. Contact your vet if a large amount was consumed.",
    requiresEmergencyVisit: false,
    alternatives: ["blueberries", "apple-slices"],
    sources: [{ name: "American Kennel Club", url: "https://www.akc.org/" }],
    body: `Maple syrup is not toxic to pets, but it is concentrated sugar with no nutritional benefit. It can cause weight gain, dental problems, and digestive upset.

Some pancake syrups contain xylitol or artificial sweeteners, which can be dangerous. Check labels and avoid sharing syrups.`,
  },
  {
    id: "caramel",
    name: "Caramel",
    slug: "caramel",
    aliases: ["candy-caramel"],
    categories: ["sweets", "human-foods"],
    tags: ["sugar", "dairy"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary: "Not toxic, but high sugar and dairy can cause upset.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "High sugar and lactose make caramel a poor choice.",
    },
    preparationNotes:
      "Avoid caramel. Some products contain xylitol or chocolate.",
    safeAmount: "Avoid.",
    frequency: "Avoid.",
    symptoms: [
      "upset-stomach",
      "vomiting",
      "diarrhea",
      "weight-gain",
      "dental-decay",
    ],
    whatToDo: "Monitor. Contact your vet if toxic ingredients were present.",
    requiresEmergencyVisit: false,
    alternatives: ["blueberries", "plain-yogurt"],
    sources: [{ name: "American Kennel Club", url: "https://www.akc.org/" }],
    body: `Caramel is mostly sugar and sometimes dairy. It can cause stomach upset, weight gain, and dental issues in pets. Some caramels contain chocolate or xylitol, which are toxic.

It is best to avoid caramel and offer healthier treats.`,
  },
  {
    id: "ice-cream",
    name: "Ice Cream",
    slug: "ice-cream",
    aliases: ["vanilla-ice-cream"],
    categories: ["sweets", "human-foods"],
    tags: ["dairy", "sugar"],
    safetyDogs: {
      status: "limited",
      severity: "low",
      summary:
        "Many dogs are lactose intolerant; high sugar and fat.",
    },
    safetyCats: {
      status: "limited",
      severity: "low",
      summary: "Not recommended due to lactose and sugar.",
    },
    preparationNotes:
      "Consider dog-safe frozen treats instead. Avoid chocolate, xylitol, and artificial sweeteners.",
    safeAmount: "A tiny lick very occasionally.",
    frequency: "Rarely.",
    symptoms: ["diarrhea", "vomiting", "gas", "weight-gain"],
    whatToDo:
      "Stop feeding ice cream if digestive upset occurs. Contact your vet if symptoms persist.",
    requiresEmergencyVisit: false,
    alternatives: ["plain-yogurt", "blueberries", "frozen-pumpkin"],
    sources: [{ name: "American Kennel Club", url: "https://www.akc.org/" }],
    body: `Ice cream is not toxic to most dogs, but many are lactose intolerant. The sugar and fat content can cause digestive upset and weight gain. Some ice creams contain xylitol or chocolate.

Frozen plain yogurt or pureed pumpkin can be a safer cool treat for pets.`,
  },
  {
    id: "raisin-bread",
    name: "Raisin Bread",
    slug: "raisin-bread",
    aliases: ["cinnamon-raisin-bread"],
    categories: ["sweets", "human-foods"],
    tags: ["raisin-toxic", "kidney-toxic"],
    safetyDogs: {
      status: "toxic",
      severity: "high",
      summary: "Raisins are highly toxic and can cause kidney failure.",
    },
    safetyCats: {
      status: "toxic",
      severity: "high",
      summary: "Raisins are highly toxic and can cause kidney failure.",
    },
    symptoms: [
      "vomiting",
      "diarrhea",
      "lethargy",
      "decreased-appetite",
      "abdominal-pain",
      "kidney-failure",
    ],
    symptomsSeverity: [{ symptom: "kidney-failure", severity: "critical" }],
    whatToDo:
      "Seek emergency veterinary care immediately, even if only a small amount was eaten.",
    requiresEmergencyVisit: true,
    alternatives: ["plain-bread", "blueberries", "apple-slices"],
    relatedFoods: ["grapes", "raisins"],
    sources: [
      {
        name: "ASPCA",
        url: "https://www.aspca.org/pet-care/animal-poison-control",
      },
      {
        name: "Pet Poison Helpline",
        url: "https://www.petpoisonhelpline.com/",
      },
    ],
    body: `Raisin bread contains raisins, which are highly toxic to dogs and cats. Even a small number of raisins can cause acute kidney failure in some animals.

Do not wait for symptoms to appear. Contact a veterinarian or animal poison control immediately if your pet eats raisin bread.`,
  },
]
