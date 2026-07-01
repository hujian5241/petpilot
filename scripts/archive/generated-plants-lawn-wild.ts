interface PlantInput {
  id: string
  name: string
  slug: string
  scientific_name?: string
  aliases: string[]
  categories: string[]
  tags: string[]
  safetyDogs: { status: string; severity?: string; summary: string }
  safetyCats: { status: string; severity?: string; summary: string }
  symptoms: string[]
  symptomsSeverity?: { symptom: string; severity: string }[]
  whatToDo: string
  requiresEmergencyVisit: boolean
  alternatives: string[]
  relatedPlants?: string[]
  lookalikes?: string[]
  sources?: { name: string; url?: string }[]
  notesForPuppies?: string
  notesForKittens?: string
  body: string
  metaTitle?: string
  metaDescription?: string
}

export const lawnWildPlants: PlantInput[] = [
  {
    id: 'wild-mushrooms',
    name: 'Wild Mushrooms',
    slug: 'wild-mushrooms',
    scientific_name: 'Various species',
    aliases: ['wild fungi', 'backyard mushrooms', 'lawn mushrooms', 'toadstools'],
    categories: ['outdoor-plants'],
    tags: ['fungi', 'lawn', 'toxic', 'high-risk'],
    safetyDogs: {
      status: 'toxic',
      severity: 'critical',
      summary:
        'Many wild mushrooms can cause life-threatening liver, kidney, or neurologic damage.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'critical',
      summary: 'Even small amounts of certain mushrooms can be deadly to cats.',
    },
    symptoms: [
      'vomiting',
      'diarrhea',
      'drooling',
      'tremors',
      'seizures',
      'lethargy',
      'jaundice',
      'coma',
    ],
    symptomsSeverity: [
      { symptom: 'vomiting', severity: 'moderate' },
      { symptom: 'seizures', severity: 'critical' },
      { symptom: 'jaundice', severity: 'critical' },
    ],
    whatToDo:
      'Treat every wild mushroom ingestion as an emergency. Do not wait for symptoms. Contact a veterinarian, ASPCA Animal Poison Control, or Pet Poison Helpline immediately. Bring a sample or photo of the mushroom if safe to do so.',
    requiresEmergencyVisit: true,
    alternatives: ['dandelion', 'white-clover', 'common-plantain'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    notesForPuppies:
      'Puppies are especially likely to mouth mushrooms and are more vulnerable to toxins.',
    notesForKittens: 'Kittens can be poisoned by tiny amounts. Remove all lawn mushrooms promptly.',
    body: `Wild mushrooms are among the most dangerous things a pet can find in a lawn. Some cause vomiting and diarrhea within hours, while others destroy the liver or kidneys days after ingestion. The most toxic species can cause seizures, coma, or death.

Because it is nearly impossible to tell safe mushrooms from deadly ones by appearance alone, never let pets eat wild mushrooms. Pick and discard mushrooms as soon as they appear, and seek emergency veterinary care immediately if ingestion is suspected, even if your pet seems fine at first.`,
    metaTitle: 'Wild Mushrooms and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Wild mushrooms can be deadly to dogs and cats. Learn symptoms of mushroom poisoning and what to do if your pet eats a backyard mushroom.',
  },
  {
    id: 'poison-ivy',
    name: 'Poison Ivy',
    slug: 'poison-ivy',
    scientific_name: 'Toxicodendron radicans',
    aliases: ['eastern poison ivy', 'three-leaved ivy'],
    categories: ['outdoor-plants'],
    tags: ['vine', 'weed', 'toxic', 'contact-irritant', 'native'],
    safetyDogs: {
      status: 'toxic',
      severity: 'moderate',
      summary: 'Mostly a skin irritant; dogs can transfer oils to humans and develop rashes.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'moderate',
      summary:
        'Skin contact can cause irritation and itching; ingestion may irritate the mouth and stomach.',
    },
    symptoms: ['red skin', 'itching', 'blisters', 'swelling', 'vomiting', 'diarrhea'],
    whatToDo:
      'Wash the exposed area with dish soap and cool water. Bathe the pet with a degreasing shampoo and contact a veterinarian if swelling, vomiting, or severe itching occurs.',
    requiresEmergencyVisit: false,
    alternatives: ['dandelion', 'white-clover', 'common-plantain'],
    relatedPlants: ['poison-oak', 'poison-sumac'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Poison ivy contains urushiol, an oil that causes an itchy, blistering rash in many animals and people. Dogs and cats are less sensitive than humans, but their fur can carry the oil indoors and expose family members.

If your pet contacts poison ivy, wear gloves and bathe them with a degreasing pet shampoo. Avoid letting pets roam in wooded edges or overgrown areas where poison ivy grows, and learn to recognize its distinctive three-leaf pattern.`,
    metaTitle: 'Poison Ivy and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Poison ivy can irritate dogs and cats and spread rash-causing oils to people. Learn how to treat exposure and keep pets safe.',
  },
  {
    id: 'poison-oak',
    name: 'Poison Oak',
    slug: 'poison-oak',
    scientific_name: 'Toxicodendron diversilobum',
    aliases: ['western poison oak', 'oakleaf ivy'],
    categories: ['outdoor-plants'],
    tags: ['shrub', 'vine', 'toxic', 'contact-irritant', 'native'],
    safetyDogs: {
      status: 'toxic',
      severity: 'moderate',
      summary: 'Causes skin irritation and can be transferred to humans via fur.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'moderate',
      summary: 'May cause dermatitis, itching, and gastrointestinal upset if ingested.',
    },
    symptoms: ['itchy skin', 'redness', 'blisters', 'swelling', 'vomiting', 'drooling'],
    whatToDo:
      'Bathe the pet with a degreasing shampoo and rinse thoroughly. Call a vet if symptoms are severe or if the pet develops vomiting or swelling.',
    requiresEmergencyVisit: false,
    alternatives: ['creeping-thyme', 'dandelion', 'white-clover'],
    relatedPlants: ['poison-ivy', 'poison-sumac'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Poison oak is closely related to poison ivy and contains the same rash-causing oil, urushiol. It grows as a shrub or vine and is common along trails, fences, and woodland edges.

Pets can brush against the leaves and carry the oil home. If exposure occurs, bathe your pet promptly and wash any bedding or collars that may have contacted the plant.`,
    metaTitle: 'Poison Oak and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Poison oak can irritate pets and spread rash-causing oils. Learn symptoms and how to safely remove poison oak oil from fur.',
  },
  {
    id: 'poison-sumac',
    name: 'Poison Sumac',
    slug: 'poison-sumac',
    scientific_name: 'Toxicodendron vernix',
    aliases: ['swamp sumac', 'thunderwood'],
    categories: ['outdoor-plants'],
    tags: ['shrub', 'toxic', 'contact-irritant', 'wetland'],
    safetyDogs: {
      status: 'toxic',
      severity: 'high',
      summary:
        'Causes severe skin irritation and allergic reactions; ingestion can irritate the digestive tract.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'high',
      summary:
        'Contact can cause intense itching and dermatitis; ingestion may lead to vomiting and drooling.',
    },
    symptoms: [
      'severe itching',
      'blisters',
      'red skin',
      'swelling',
      'vomiting',
      'drooling',
      'difficulty breathing',
    ],
    whatToDo:
      'Bathe the pet with a degreasing shampoo and contact a veterinarian immediately if there is facial swelling or breathing difficulty.',
    requiresEmergencyVisit: true,
    alternatives: ['dandelion', 'white-clover', 'common-plantain'],
    relatedPlants: ['poison-ivy', 'poison-oak'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Poison sumac is a large shrub or small tree that grows in wet, swampy areas. Like poison ivy and poison oak, it produces urushiol oil that causes severe contact dermatitis.

Pets exposed to poison sumac should be bathed immediately. If the plant was ingested or if swelling around the face or difficulty breathing develops, seek emergency veterinary care right away.`,
    metaTitle: 'Poison Sumac and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Poison sumac causes severe skin irritation in pets. Learn emergency symptoms and how to treat poison sumac exposure.',
  },
  {
    id: 'black-walnut',
    name: 'Black Walnut',
    slug: 'black-walnut',
    scientific_name: 'Juglans nigra',
    aliases: ['eastern black walnut', 'walnut tree'],
    categories: ['outdoor-plants'],
    tags: ['tree', 'nut', 'toxic', 'mold-risk'],
    safetyDogs: {
      status: 'toxic',
      severity: 'high',
      summary:
        'Moldy nuts and hulls can cause tremors and seizures; plain nuts may cause GI upset or obstruction.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'moderate',
      summary:
        'Less commonly eaten, but moldy hulls are dangerous and plain nuts can cause obstruction.',
    },
    symptoms: ['vomiting', 'diarrhea', 'tremors', 'seizures', 'weakness', 'fever'],
    symptomsSeverity: [
      { symptom: 'tremors', severity: 'high' },
      { symptom: 'seizures', severity: 'critical' },
    ],
    whatToDo:
      'Remove fallen nuts and hulls from the yard. If your pet eats moldy black walnut material or shows tremors or seizures, go to an emergency vet immediately.',
    requiresEmergencyVisit: true,
    alternatives: ['dandelion', 'white-clover', 'sunflower'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    notesForPuppies:
      'Puppies may chew fallen nuts and are at high risk for mold toxin exposure and intestinal blockage.',
    body: `Black walnut trees drop large nuts encased in thick, green hulls. The nuts themselves are not highly toxic when fresh, but moldy hulls and nuts can contain tremorgenic mycotoxins that cause seizures within hours of ingestion.

Dogs are the most commonly affected pets. Keeping yards free of fallen black walnuts is the best prevention, especially after rain when mold grows quickly.`,
    metaTitle: 'Black Walnut and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Black walnut hulls and moldy nuts can cause seizures in dogs. Learn symptoms and how to remove black walnuts from your yard.',
  },
  {
    id: 'foxglove',
    name: 'Foxglove',
    slug: 'foxglove',
    scientific_name: 'Digitalis purpurea',
    aliases: ['digitalis', "lady's glove", 'fairy bells'],
    categories: ['outdoor-plants'],
    tags: ['flower', 'toxic', 'cardiac-toxin', 'ornamental'],
    safetyDogs: {
      status: 'toxic',
      severity: 'critical',
      summary:
        'Contains cardiac glycosides that can cause life-threatening heart rhythm abnormalities.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'critical',
      summary: 'All parts are highly toxic and can cause severe cardiac effects.',
    },
    symptoms: [
      'vomiting',
      'diarrhea',
      'drooling',
      'weakness',
      'irregular heartbeat',
      'collapse',
      'seizures',
    ],
    symptomsSeverity: [
      { symptom: 'irregular heartbeat', severity: 'critical' },
      { symptom: 'collapse', severity: 'critical' },
    ],
    whatToDo:
      'Seek emergency veterinary care immediately. Do not induce vomiting unless instructed by a professional. Bring a sample of the plant.',
    requiresEmergencyVisit: true,
    alternatives: ['dandelion', 'white-clover', 'common-plantain'],
    relatedPlants: ['oleander'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Foxglove is a striking biennial flower with tall spikes of bell-shaped blooms. It contains powerful cardiac glycosides that affect heart rhythm and can be fatal even in small amounts.

Both dogs and cats are at risk if they chew leaves, flowers, or stems. Immediate veterinary care is essential for any suspected ingestion.`,
    metaTitle: 'Foxglove and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Foxglove is highly toxic to dogs and cats and affects the heart. Learn symptoms of foxglove poisoning and emergency treatment.',
  },
  {
    id: 'yew',
    name: 'Yew',
    slug: 'yew',
    scientific_name: 'Taxus spp.',
    aliases: ['english yew', 'japanese yew', 'taxus'],
    categories: ['outdoor-plants'],
    tags: ['shrub', 'tree', 'toxic', 'evergreen', 'ornamental'],
    safetyDogs: {
      status: 'toxic',
      severity: 'critical',
      summary: 'All parts except the red aril are extremely toxic and can cause sudden death.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'critical',
      summary: 'Highly toxic; even small amounts can be fatal.',
    },
    symptoms: [
      'vomiting',
      'difficulty breathing',
      'tremors',
      'seizures',
      'sudden collapse',
      'death',
    ],
    symptomsSeverity: [
      { symptom: 'difficulty breathing', severity: 'critical' },
      { symptom: 'sudden collapse', severity: 'critical' },
    ],
    whatToDo:
      'Go to an emergency veterinarian immediately. Yew poisoning can progress rapidly and is often fatal without prompt treatment.',
    requiresEmergencyVisit: true,
    alternatives: ['dandelion', 'white-clover', 'common-plantain'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Yews are popular evergreen shrubs used in landscaping. Every part of the plant, including needles, bark, and seeds, contains highly toxic alkaloids that affect the heart.

Symptoms can appear suddenly after ingestion, and the plant is dangerous enough that death may occur before other signs are noticed. Keep pets away from yew hedges at all times.`,
    metaTitle: 'Yew and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Yew is one of the most toxic plants to dogs and cats. Learn the signs of yew poisoning and why emergency care is critical.',
  },
  {
    id: 'deadly-nightshade',
    name: 'Deadly Nightshade',
    slug: 'deadly-nightshade',
    scientific_name: 'Atropa belladonna',
    aliases: ['belladonna', "devil's cherries"],
    categories: ['outdoor-plants'],
    tags: ['weed', 'toxic', 'berry', 'neurotoxin'],
    safetyDogs: {
      status: 'toxic',
      severity: 'critical',
      summary: 'Extremely toxic; can cause paralysis, seizures, coma, and death.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'critical',
      summary: 'Very small amounts of leaves or berries can be fatal.',
    },
    symptoms: [
      'dilated pupils',
      'dry mouth',
      'rapid heartbeat',
      'confusion',
      'seizures',
      'paralysis',
      'coma',
    ],
    symptomsSeverity: [
      { symptom: 'seizures', severity: 'critical' },
      { symptom: 'paralysis', severity: 'critical' },
    ],
    whatToDo: 'Seek emergency veterinary care immediately. Do not wait for symptoms to develop.',
    requiresEmergencyVisit: true,
    alternatives: ['dandelion', 'white-clover', 'common-plantain'],
    relatedPlants: ['bittersweet-nightshade', 'black-nightshade'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Deadly nightshade is a branching perennial with dull purple bell-shaped flowers and shiny black berries. It contains tropane alkaloids that disrupt the nervous system.

Ingestion of leaves or berries is a medical emergency for pets. Pets should not be allowed to forage in unmanaged lots or roadsides where this plant may grow.`,
    metaTitle: 'Deadly Nightshade and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Deadly nightshade berries and leaves are extremely toxic to pets. Learn symptoms of nightshade poisoning and emergency steps.',
  },
  {
    id: 'bittersweet-nightshade',
    name: 'Bittersweet Nightshade',
    slug: 'bittersweet-nightshade',
    scientific_name: 'Solanum dulcamara',
    aliases: ['climbing nightshade', 'woody nightshade', 'bittersweet'],
    categories: ['outdoor-plants'],
    tags: ['vine', 'weed', 'toxic', 'berry'],
    safetyDogs: {
      status: 'toxic',
      severity: 'moderate',
      summary: 'Berries and leaves can cause GI upset and neurologic signs.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'moderate',
      summary: 'Ingestion may cause vomiting, drooling, weakness, and drowsiness.',
    },
    symptoms: ['vomiting', 'diarrhea', 'drooling', 'drowsiness', 'weakness', 'dilated pupils'],
    whatToDo:
      'Contact a veterinarian or poison control. If several berries were eaten or symptoms develop, seek emergency care.',
    requiresEmergencyVisit: false,
    alternatives: ['dandelion', 'white-clover', 'common-plantain'],
    relatedPlants: ['deadly-nightshade', 'black-nightshade'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Bittersweet nightshade is a woody vine with purple flowers and bright red berries. It is common along fences, roadsides, and neglected yards.

While less toxic than deadly nightshade, the berries and leaves can still make pets ill. Removing vines from pet-accessible areas reduces the risk of accidental ingestion.`,
    metaTitle: 'Bittersweet Nightshade and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Bittersweet nightshade berries can poison dogs and cats. Learn symptoms and what to do if your pet eats this common vine.',
  },
  {
    id: 'black-nightshade',
    name: 'Black Nightshade',
    slug: 'black-nightshade',
    scientific_name: 'Solanum nigrum',
    aliases: ['garden nightshade', 'houndsberry'],
    categories: ['outdoor-plants'],
    tags: ['weed', 'toxic', 'berry'],
    safetyDogs: {
      status: 'toxic',
      severity: 'moderate',
      summary: 'Unripe berries and leaves contain solanine and can cause GI and neurologic signs.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'moderate',
      summary: 'Chewing plants or eating unripe berries may lead to vomiting and lethargy.',
    },
    symptoms: ['vomiting', 'diarrhea', 'drooling', 'weakness', 'dilated pupils', 'tremors'],
    whatToDo:
      'Call a veterinarian or poison control. Bring a sample of the plant and note how many berries were eaten.',
    requiresEmergencyVisit: false,
    alternatives: ['dandelion', 'white-clover', 'common-plantain'],
    relatedPlants: ['deadly-nightshade', 'bittersweet-nightshade'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Black nightshade is an annual weed with small white flowers and dark berries. Unripe berries and foliage contain solanine, which can irritate the digestive system and nervous system.

Ripe berries are less toxic but still not safe. Pets that graze weeds should be supervised, and garden areas should be cleared of nightshade.`,
    metaTitle: 'Black Nightshade and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Black nightshade berries and leaves are toxic to pets. Learn symptoms and how to keep dogs and cats away from this common weed.',
  },
  {
    id: 'common-milkweed',
    name: 'Common Milkweed',
    slug: 'common-milkweed',
    scientific_name: 'Asclepias syriaca',
    aliases: ['milkweed', 'silkweed', 'butterfly flower'],
    categories: ['outdoor-plants'],
    tags: ['wildflower', 'toxic', 'native', 'monarch-host'],
    safetyDogs: {
      status: 'toxic',
      severity: 'high',
      summary: 'Contains cardenolides that can cause severe cardiac and neurologic effects.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'high',
      summary: 'All parts are toxic; ingestion is dangerous.',
    },
    symptoms: [
      'vomiting',
      'diarrhea',
      'depression',
      'weakness',
      'difficulty breathing',
      'seizures',
    ],
    symptomsSeverity: [
      { symptom: 'difficulty breathing', severity: 'critical' },
      { symptom: 'seizures', severity: 'critical' },
    ],
    whatToDo:
      'Contact a veterinarian immediately if any part of the plant was eaten. Emergency care is often needed.',
    requiresEmergencyVisit: true,
    alternatives: ['bee-balm', 'echinacea', 'dandelion'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Milkweed is an important native wildflower for monarch butterflies, but it is dangerous to dogs and cats. The plant contains cardenolides that affect the heart.

Pets that chew on milkweed leaves or stems can become seriously ill. If you grow milkweed for pollinators, place it in an area pets cannot reach.`,
    metaTitle: 'Common Milkweed and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Milkweed supports butterflies but is toxic to dogs and cats. Learn milkweed poisoning symptoms and how to protect pets.',
  },
  {
    id: 'autumn-crocus',
    name: 'Autumn Crocus',
    slug: 'autumn-crocus',
    scientific_name: 'Colchicum autumnale',
    aliases: ['meadow saffron', 'naked lady'],
    categories: ['outdoor-plants'],
    tags: ['flower', 'bulb', 'toxic', 'critical'],
    safetyDogs: {
      status: 'toxic',
      severity: 'critical',
      summary: 'Contains colchicine, which causes severe, delayed, multi-organ failure.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'critical',
      summary: 'Highly toxic; ingestion can be fatal.',
    },
    symptoms: ['vomiting', 'diarrhea', 'bloody diarrhea', 'shock', 'seizures', 'organ failure'],
    symptomsSeverity: [
      { symptom: 'bloody diarrhea', severity: 'critical' },
      { symptom: 'organ failure', severity: 'critical' },
    ],
    whatToDo:
      'Seek emergency veterinary care immediately. Symptoms may be delayed, so do not wait.',
    requiresEmergencyVisit: true,
    alternatives: ['dandelion', 'white-clover', 'common-plantain'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Autumn crocus is a fall-blooming bulb that contains colchicine, a toxin that damages rapidly dividing cells. Pets that chew on bulbs, leaves, or flowers can develop severe gastrointestinal bleeding, organ failure, or death.

Because signs can be delayed for days, any suspected ingestion should be treated as an emergency.`,
    metaTitle: 'Autumn Crocus and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Autumn crocus bulbs are extremely toxic to dogs and cats. Learn why symptoms may be delayed and what emergency care involves.',
  },
  {
    id: 'water-hemlock',
    name: 'Water Hemlock',
    slug: 'water-hemlock',
    scientific_name: 'Cicuta maculata',
    aliases: ['spotted cowbane', 'beaver poison'],
    categories: ['outdoor-plants'],
    tags: ['weed', 'toxic', 'wetland', 'neurotoxin'],
    safetyDogs: {
      status: 'toxic',
      severity: 'critical',
      summary: 'One of the most toxic plants in North America; can kill within hours.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'critical',
      summary: 'Extremely toxic; ingestion requires immediate emergency care.',
    },
    symptoms: ['drooling', 'tremors', 'seizures', 'bloating', 'respiratory failure', 'death'],
    whatToDo:
      'Get to an emergency veterinarian immediately. Water hemlock poisoning is often rapidly fatal.',
    requiresEmergencyVisit: true,
    alternatives: ['dandelion', 'common-plantain', 'white-clover'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Water hemlock grows in wet meadows, ditches, and along streams. It contains cicutoxin, a potent neurotoxin that causes violent seizures and respiratory failure.

Even a small amount can be lethal. Dogs roaming near ponds or wet fields should be supervised closely, and any suspected ingestion must be treated as an emergency.`,
    metaTitle: 'Water Hemlock and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Water hemlock is one of the deadliest plants for pets. Learn symptoms of water hemlock poisoning and how to avoid exposure.',
  },
  {
    id: 'oleander',
    name: 'Oleander',
    slug: 'oleander',
    scientific_name: 'Nerium oleander',
    aliases: ['rose bay', 'nerium oleander'],
    categories: ['outdoor-plants'],
    tags: ['shrub', 'toxic', 'ornamental', 'cardiac-toxin'],
    safetyDogs: {
      status: 'toxic',
      severity: 'critical',
      summary: 'All parts are highly toxic; can cause fatal heart arrhythmias.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'critical',
      summary: 'Extremely toxic; ingestion may be fatal.',
    },
    symptoms: ['vomiting', 'diarrhea', 'irregular heartbeat', 'weakness', 'tremors', 'collapse'],
    symptomsSeverity: [
      { symptom: 'irregular heartbeat', severity: 'critical' },
      { symptom: 'collapse', severity: 'critical' },
    ],
    whatToDo: 'Go to an emergency vet immediately. Do not induce vomiting. Bring a plant sample.',
    requiresEmergencyVisit: true,
    alternatives: ['dandelion', 'white-clover', 'common-plantain'],
    relatedPlants: ['foxglove'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Oleander is a popular flowering shrub in warm climates. Every part of the plant, including dried leaves and flowers, contains cardiac glycosides that can disrupt heart rhythm and cause death.

Pets should never have access to oleander. If a pet chews or ingests any part of the plant, emergency treatment is critical.`,
    metaTitle: 'Oleander and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Oleander is highly toxic to dogs and cats and affects the heart. Learn symptoms and why emergency care is essential.',
  },
  {
    id: 'castor-bean',
    name: 'Castor Bean',
    slug: 'castor-bean',
    scientific_name: 'Ricinus communis',
    aliases: ['castor oil plant', 'ricinus', 'mole bean'],
    categories: ['outdoor-plants'],
    tags: ['shrub', 'toxic', 'seed', 'ornamental'],
    safetyDogs: {
      status: 'toxic',
      severity: 'critical',
      summary: 'Seeds contain ricin, which can cause severe organ failure and death.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'critical',
      summary: 'Highly toxic; chewing seeds can be fatal.',
    },
    symptoms: ['vomiting', 'diarrhea', 'abdominal pain', 'dehydration', 'seizures', 'collapse'],
    symptomsSeverity: [
      { symptom: 'seizures', severity: 'critical' },
      { symptom: 'collapse', severity: 'critical' },
    ],
    whatToDo:
      'Seek emergency veterinary care immediately. Ricin poisoning can progress quickly and is life-threatening.',
    requiresEmergencyVisit: true,
    alternatives: ['sunflower', 'marigold', 'dandelion'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Castor bean plants are grown for their dramatic foliage and interesting seed pods. The seeds contain ricin, one of the most potent plant toxins known.

Chewing or swallowing castor beans can cause severe vomiting, dehydration, and organ damage in dogs and cats. Emergency treatment gives the best chance of survival.`,
    metaTitle: 'Castor Bean and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Castor bean seeds contain ricin and are extremely toxic to pets. Learn symptoms and why immediate veterinary care is needed.',
  },
  {
    id: 'ragwort',
    name: 'Ragwort',
    slug: 'ragwort',
    scientific_name: 'Senecio jacobaea',
    aliases: ['tansy ragwort', 'stinking willie', 'groundsel'],
    categories: ['outdoor-plants'],
    tags: ['weed', 'toxic', 'liver-toxin', 'wildflower'],
    safetyDogs: {
      status: 'toxic',
      severity: 'high',
      summary: 'Cumulative liver toxin; fresh or dried plant material is dangerous.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'high',
      summary: 'Can cause liver failure with repeated or large ingestion.',
    },
    symptoms: ['vomiting', 'diarrhea', 'lethargy', 'jaundice', 'confusion', 'weight loss'],
    whatToDo:
      'Contact a veterinarian if ingestion is suspected. Blood tests may be needed to assess liver damage.',
    requiresEmergencyVisit: true,
    alternatives: ['dandelion', 'common-plantain', 'white-clover'],
    relatedPlants: ['tansy'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Ragwort is a yellow-flowered weed that contains pyrrolizidine alkaloids. These toxins damage the liver over time and can be present even in dried hay.

Dogs and cats that repeatedly graze on ragwort may develop progressive liver disease. Removing the plant from pastures and yards is important for long-term safety.`,
    metaTitle: 'Ragwort and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Ragwort damages the liver in dogs and cats. Learn symptoms of ragwort poisoning and how to remove this weed safely.',
  },
  {
    id: 'tansy',
    name: 'Tansy',
    slug: 'tansy',
    scientific_name: 'Tanacetum vulgare',
    aliases: ['common tansy', 'golden buttons', 'bitter buttons'],
    categories: ['outdoor-plants'],
    tags: ['weed', 'toxic', 'wildflower', 'herb'],
    safetyDogs: {
      status: 'toxic',
      severity: 'high',
      summary: 'Contains thujone and other compounds that can cause seizures and liver damage.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'high',
      summary: 'Toxic if ingested; can cause vomiting, diarrhea, and neurologic signs.',
    },
    symptoms: ['vomiting', 'diarrhea', 'drooling', 'tremors', 'seizures', 'skin irritation'],
    whatToDo:
      'Contact a veterinarian or poison control. If tremors or seizures occur, go to an emergency clinic.',
    requiresEmergencyVisit: true,
    alternatives: ['yarrow', 'echinacea', 'dandelion'],
    relatedPlants: ['ragwort'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Common tansy is a perennial herb with yellow button-like flowers. It is sometimes grown as an ornamental or insect repellent, but it is toxic to pets.

Ingestion can lead to gastrointestinal upset, seizures, and liver injury. Pets should not be allowed to chew tansy, and the plant should be removed from pet-accessible gardens.`,
    metaTitle: 'Tansy and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Tansy is toxic to dogs and cats and can cause seizures. Learn symptoms and how to keep pets away from this common herb.',
  },
  {
    id: 'mayapple',
    name: 'Mayapple',
    slug: 'mayapple',
    scientific_name: 'Podophyllum peltatum',
    aliases: ['mandrake', 'umbrella plant', "devil's apple"],
    categories: ['outdoor-plants'],
    tags: ['wildflower', 'toxic', 'native', 'fruit'],
    safetyDogs: {
      status: 'toxic',
      severity: 'high',
      summary:
        'Roots, leaves, and unripe fruit contain podophyllotoxin; ripe fruit is less toxic but still risky.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'high',
      summary:
        'All plant parts except fully ripe fruit are toxic; ingestion can cause severe GI signs.',
    },
    symptoms: ['vomiting', 'diarrhea', 'drooling', 'abdominal pain', 'lethargy', 'tremors'],
    whatToDo: 'Contact a veterinarian immediately. Bring a sample of the plant or fruit.',
    requiresEmergencyVisit: true,
    alternatives: ['wild-strawberry', 'dandelion', 'white-clover'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Mayapple is a native woodland plant with large umbrella-like leaves. The roots and leaves contain podophyllotoxin, and the unripe fruit is also dangerous.

Dogs that dig up mayapple roots or eat the fruit can become seriously ill. Keep pets out of wooded areas where mayapple grows densely.`,
    metaTitle: 'Mayapple and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Mayapple roots, leaves, and unripe fruit are toxic to pets. Learn symptoms of mayapple poisoning and safe alternatives.',
  },
  {
    id: 'white-snakeroot',
    name: 'White Snakeroot',
    slug: 'white-snakeroot',
    scientific_name: 'Ageratina altissima',
    aliases: ['richweed', 'snakeroot', 'white sanicle'],
    categories: ['outdoor-plants'],
    tags: ['weed', 'toxic', 'native', 'woodland'],
    safetyDogs: {
      status: 'toxic',
      severity: 'high',
      summary:
        'Contains tremetol, which can cause weakness, tremors, and fatal milk sickness in grazing animals.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'high',
      summary: 'Ingestion can cause vomiting, weakness, and neurologic signs.',
    },
    symptoms: ['vomiting', 'diarrhea', 'weakness', 'tremors', 'difficulty standing', 'depression'],
    whatToDo: 'Seek veterinary care promptly, especially if tremors or weakness develop.',
    requiresEmergencyVisit: true,
    alternatives: ['common-plantain', 'white-clover', 'dandelion'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `White snakeroot is a shade-loving woodland plant with clusters of small white flowers. It contains tremetol, a fat-soluble toxin historically known for causing milk sickness.

Pets that chew on the leaves can develop weakness, tremors, and gastrointestinal signs. Removing white snakeroot from shaded yards helps keep dogs and cats safe.`,
    metaTitle: 'White Snakeroot and Pets — Safety Guide | PetPilot',
    metaDescription:
      'White snakeroot is toxic to pets and causes tremors and weakness. Learn symptoms and how to remove this woodland weed.',
  },
  {
    id: 'jimsonweed',
    name: 'Jimsonweed',
    slug: 'jimsonweed',
    scientific_name: 'Datura stramonium',
    aliases: ["devil's trumpet", 'thorn apple', 'stinkweed'],
    categories: ['outdoor-plants'],
    tags: ['weed', 'toxic', 'neurotoxin', 'invasive'],
    safetyDogs: {
      status: 'toxic',
      severity: 'high',
      summary:
        'Contains tropane alkaloids that cause hallucinations, seizures, and life-threatening heart effects.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'high',
      summary: 'Highly toxic; ingestion can cause severe neurologic and cardiac signs.',
    },
    symptoms: [
      'dilated pupils',
      'dry mouth',
      'rapid heartbeat',
      'agitation',
      'hallucinations',
      'seizures',
      'coma',
    ],
    whatToDo: 'Get emergency veterinary care immediately. Do not wait for symptoms.',
    requiresEmergencyVisit: true,
    alternatives: ['dandelion', 'common-plantain', 'white-clover'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Jimsonweed is a foul-smelling annual weed with large white or purple trumpet-shaped flowers and spiny seed pods. All parts contain tropane alkaloids that disrupt the nervous system and heart.

Pets that ingest jimsonweed can become dangerously agitated, overheated, and confused. Emergency treatment is essential.`,
    metaTitle: 'Jimsonweed and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Jimsonweed is a toxic weed that affects the heart and nervous system in pets. Learn symptoms and emergency treatment.',
  },
  {
    id: 'pokeberry',
    name: 'Pokeberry',
    slug: 'pokeberry',
    scientific_name: 'Phytolacca americana',
    aliases: ['pokeweed', 'american pokeweed', 'inkberry'],
    categories: ['outdoor-plants'],
    tags: ['weed', 'toxic', 'berry', 'native'],
    safetyDogs: {
      status: 'toxic',
      severity: 'high',
      summary:
        'Roots, stems, leaves, and unripe berries are toxic; ripe berries are less toxic but still unsafe.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'high',
      summary: 'Chewing any part can cause severe vomiting, diarrhea, and weakness.',
    },
    symptoms: [
      'vomiting',
      'diarrhea',
      'drooling',
      'abdominal pain',
      'weakness',
      'difficulty breathing',
    ],
    whatToDo:
      'Contact a veterinarian or poison control immediately. If symptoms are severe, go to an emergency clinic.',
    requiresEmergencyVisit: true,
    alternatives: ['wild-strawberry', 'dandelion', 'white-clover'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Pokeberry, or pokeweed, is a tall perennial weed with clusters of dark purple berries. It is native to North America and often found in disturbed soils.

The entire plant is toxic, with the highest concentrations in roots and seeds. Pets that eat pokeberry can develop severe gastrointestinal distress and should be treated by a veterinarian.`,
    metaTitle: 'Pokeberry and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Pokeberry is a toxic weed with dangerous berries and roots. Learn symptoms of pokeberry poisoning in dogs and cats.',
  },
  {
    id: 'azalea',
    name: 'Azalea',
    slug: 'azalea',
    scientific_name: 'Rhododendron spp.',
    aliases: ['azalea bush', 'rosebay'],
    categories: ['outdoor-plants'],
    tags: ['shrub', 'toxic', 'flower', 'ornamental'],
    safetyDogs: {
      status: 'toxic',
      severity: 'moderate',
      summary: 'Contains grayanotoxins that can cause vomiting, weakness, and heart effects.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'moderate',
      summary: 'Ingestion can cause drooling, vomiting, diarrhea, and weakness.',
    },
    symptoms: [
      'vomiting',
      'diarrhea',
      'drooling',
      'weakness',
      'low blood pressure',
      'abnormal heart rate',
    ],
    whatToDo:
      'Contact a veterinarian or poison control. Emergency care may be needed depending on the amount eaten.',
    requiresEmergencyVisit: false,
    alternatives: ['dandelion', 'white-clover', 'common-plantain'],
    relatedPlants: ['rhododendron'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Azaleas are popular flowering shrubs with bright spring blooms. They contain grayanotoxins that affect the heart and digestive system.

Dogs and cats that chew azalea leaves or flowers may vomit and become weak. Severe cases can cause low blood pressure and abnormal heart rhythms, so veterinary guidance is important.`,
    metaTitle: 'Azalea and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Azaleas are toxic to dogs and cats and can affect the heart. Learn symptoms and what to do if your pet eats azalea leaves.',
  },
  {
    id: 'rhododendron',
    name: 'Rhododendron',
    slug: 'rhododendron',
    scientific_name: 'Rhododendron spp.',
    aliases: ['rhodie', 'rosebay', 'great laurel'],
    categories: ['outdoor-plants'],
    tags: ['shrub', 'toxic', 'evergreen', 'ornamental'],
    safetyDogs: {
      status: 'toxic',
      severity: 'moderate',
      summary: 'Contains grayanotoxins; can cause vomiting, weakness, and cardiovascular effects.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'moderate',
      summary: 'Chewing leaves or flowers can lead to drooling, vomiting, and weakness.',
    },
    symptoms: [
      'drooling',
      'vomiting',
      'diarrhea',
      'weakness',
      'abnormal heart rate',
      'low blood pressure',
    ],
    whatToDo:
      'Call a veterinarian or poison control. Monitor for weakness or heart rhythm changes and seek emergency care if these occur.',
    requiresEmergencyVisit: false,
    alternatives: ['dandelion', 'white-clover', 'common-plantain'],
    relatedPlants: ['azalea'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Rhododendrons are evergreen shrubs prized for their large clusters of flowers. Like azaleas, they contain grayanotoxins that can sicken pets.

Signs usually appear within a few hours of ingestion. Most pets recover with supportive care, but large ingestions can be serious and require veterinary attention.`,
    metaTitle: 'Rhododendron and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Rhododendron leaves and flowers are toxic to pets. Learn symptoms of rhododendron poisoning and when to seek care.',
  },
  {
    id: 'sago-palm',
    name: 'Sago Palm',
    slug: 'sago-palm',
    scientific_name: 'Cycas revoluta',
    aliases: ['king sago', 'japanese sago palm', 'cycad'],
    categories: ['outdoor-plants'],
    tags: ['palm', 'toxic', 'ornamental', 'liver-toxin'],
    safetyDogs: {
      status: 'toxic',
      severity: 'critical',
      summary: 'Seeds are especially toxic; can cause liver failure and death.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'critical',
      summary: 'All parts are dangerous and can cause severe liver damage.',
    },
    symptoms: ['vomiting', 'diarrhea', 'jaundice', 'lethargy', 'seizures', 'liver failure'],
    symptomsSeverity: [
      { symptom: 'liver failure', severity: 'critical' },
      { symptom: 'jaundice', severity: 'critical' },
    ],
    whatToDo:
      'Seek emergency veterinary care immediately, even if only a small amount was eaten. Aggressive treatment improves survival.',
    requiresEmergencyVisit: true,
    alternatives: ['dandelion', 'white-clover', 'common-plantain'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Sago palms are common ornamental landscape plants. They contain cycasin, a toxin that damages the liver and nervous system. The seeds are the most concentrated source.

Sago palm poisoning can be fatal, especially for dogs that chew the seeds. Immediate decontamination and supportive care at an emergency clinic are crucial.`,
    metaTitle: 'Sago Palm and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Sago palms cause liver failure in dogs and cats. Learn the signs of sago palm poisoning and why emergency care saves lives.',
  },
  {
    id: 'lantana',
    name: 'Lantana',
    slug: 'lantana',
    scientific_name: 'Lantana camara',
    aliases: ['shrub verbena', 'red sage', 'wild sage'],
    categories: ['outdoor-plants'],
    tags: ['shrub', 'toxic', 'flower', 'ornamental'],
    safetyDogs: {
      status: 'toxic',
      severity: 'moderate',
      summary: 'Berries and leaves can cause vomiting, diarrhea, and liver damage.',
    },
    safetyCats: {
      status: 'toxic',
      severity: 'moderate',
      summary: 'Ingestion may cause GI upset and photosensitivity.',
    },
    symptoms: ['vomiting', 'diarrhea', 'drooling', 'weakness', 'skin redness', 'liver damage'],
    whatToDo:
      'Contact a veterinarian. If many berries were eaten or symptoms persist, seek emergency care.',
    requiresEmergencyVisit: false,
    alternatives: ['marigold', 'dandelion', 'white-clover'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Lantana is a colorful flowering shrub common in warm-climate gardens. The unripe berries are the most toxic part, but leaves can also sicken pets.

Pets that chew on lantana may develop vomiting, diarrhea, and weakness. Keeping lantana out of reach and cleaning up fallen berries helps prevent poisoning.`,
    metaTitle: 'Lantana and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Lantana berries and leaves are toxic to pets. Learn symptoms of lantana poisoning and safer flower alternatives.',
  },
  {
    id: 'dandelion',
    name: 'Dandelion',
    slug: 'dandelion',
    scientific_name: 'Taraxacum officinale',
    aliases: ["lion's tooth", 'blowball', 'wild endive'],
    categories: ['outdoor-plants'],
    tags: ['weed', 'safe', 'lawn', 'edible', 'native'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe and non-toxic; leaves are sometimes used in herbal supplements.',
    },
    safetyCats: { status: 'safe', summary: 'Safe; not harmful if chewed in small amounts.' },
    symptoms: [],
    whatToDo:
      'No action needed. Make sure the plant has not been sprayed with herbicides or fertilizers.',
    requiresEmergencyVisit: false,
    alternatives: ['white-clover', 'common-plantain', 'chickweed'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Dandelions are one of the most common lawn weeds and are considered safe for dogs and cats. The leaves, flowers, and roots are not toxic and are even used in some pet supplements.

As with any outdoor plant, make sure dandelions have not been treated with pesticides or herbicides before letting pets nibble them.`,
    metaTitle: 'Dandelion and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Dandelions are safe for dogs and cats. Learn why this common lawn weed is non-toxic and what precautions to take.',
  },
  {
    id: 'white-clover',
    name: 'White Clover',
    slug: 'white-clover',
    scientific_name: 'Trifolium repens',
    aliases: ['dutch clover', 'ladino clover', 'shamrock'],
    categories: ['outdoor-plants'],
    tags: ['lawn', 'safe', 'ground-cover', 'edible'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe in small amounts; commonly found in lawns and pastures.',
    },
    safetyCats: { status: 'safe', summary: 'Non-toxic and safe if nibbled occasionally.' },
    symptoms: [],
    whatToDo: 'No action needed. Ensure the lawn is free of chemical treatments.',
    requiresEmergencyVisit: false,
    alternatives: ['dandelion', 'common-plantain', 'red-clover'],
    relatedPlants: ['red-clover'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `White clover is a low-growing legume that often appears in lawns. It is safe for pets to walk on and occasionally nibble.

Some pets develop mild stomach upset if they eat large quantities, but serious toxicity is not expected. Keep clover patches untreated by lawn chemicals.`,
    metaTitle: 'White Clover and Pets — Safety Guide | PetPilot',
    metaDescription:
      'White clover is safe for dogs and cats. Learn about this common lawn plant and how to keep it chemical-free for pets.',
  },
  {
    id: 'common-plantain',
    name: 'Common Plantain',
    slug: 'common-plantain',
    scientific_name: 'Plantago major',
    aliases: ['broadleaf plantain', 'plantain', "white man's footprint"],
    categories: ['outdoor-plants'],
    tags: ['weed', 'safe', 'lawn', 'herb'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe and non-toxic; often found in lawns and sidewalk cracks.',
    },
    safetyCats: { status: 'safe', summary: 'Safe to chew in small amounts.' },
    symptoms: [],
    whatToDo: 'No action needed. Avoid plants from chemically treated areas.',
    requiresEmergencyVisit: false,
    alternatives: ['dandelion', 'white-clover', 'chickweed'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Common plantain is a low-growing weed with broad ribbed leaves. It is safe for dogs and cats and is sometimes included in herbal remedies.

The main risk comes from lawn chemicals rather than the plant itself. Let pets snack only on plantain from untreated areas.`,
    metaTitle: 'Common Plantain and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Common plantain is safe for dogs and cats. Learn why this lawn weed is non-toxic and how to identify it.',
  },
  {
    id: 'chickweed',
    name: 'Chickweed',
    slug: 'chickweed',
    scientific_name: 'Stellaria media',
    aliases: ['starweed', 'winterweed', 'chickenwort'],
    categories: ['outdoor-plants'],
    tags: ['weed', 'safe', 'lawn', 'edible'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe and nutritious; often used in small amounts as a garden green.',
    },
    safetyCats: { status: 'safe', summary: 'Non-toxic and safe if nibbled.' },
    symptoms: [],
    whatToDo: 'No action needed. Wash thoroughly if feeding as a treat.',
    requiresEmergencyVisit: false,
    alternatives: ['dandelion', 'common-plantain', 'lambs-quarters'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Chickweed is a cool-season annual with small white star-shaped flowers. It is safe for pets and often enjoyed by chickens, rabbits, and grazing dogs.

If you offer chickweed as a snack, make sure it comes from an area without herbicides, pesticides, or pet waste contamination.`,
    metaTitle: 'Chickweed and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Chickweed is safe for dogs and cats. Learn about this edible lawn weed and how to share it safely with pets.',
  },
  {
    id: 'lambs-quarters',
    name: "Lamb's Quarters",
    slug: 'lambs-quarters',
    scientific_name: 'Chenopodium album',
    aliases: ['white goosefoot', 'wild spinach', 'pigweed'],
    categories: ['outdoor-plants'],
    tags: ['weed', 'safe', 'edible', 'lawn'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe and nutritious; related to spinach and quinoa.',
    },
    safetyCats: { status: 'safe', summary: 'Non-toxic if nibbled in small amounts.' },
    symptoms: [],
    whatToDo: 'No action needed. Harvest from untreated areas only.',
    requiresEmergencyVisit: false,
    alternatives: ['dandelion', 'common-plantain', 'purslane'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Lamb's quarters is a common garden weed with a powdery white coating on its leaves. It is not toxic to pets and is edible for humans as a spinach substitute.

As with all foraged greens, only let pets eat lamb's quarters from areas that have not been sprayed with chemicals.`,
    metaTitle: "Lamb's Quarters and Pets — Safety Guide | PetPilot",
    metaDescription:
      "Lamb's quarters is safe for dogs and cats. Learn why this wild green is non-toxic and how to identify it.",
  },
  {
    id: 'purslane',
    name: 'Purslane',
    slug: 'purslane',
    scientific_name: 'Portulaca oleracea',
    aliases: ['little hogweed', 'pigweed', 'verdolaga'],
    categories: ['outdoor-plants'],
    tags: ['weed', 'safe', 'edible', 'succulent'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe and high in omega-3 fatty acids; non-toxic to dogs.',
    },
    safetyCats: { status: 'safe', summary: 'Safe in small amounts; non-toxic.' },
    symptoms: [],
    whatToDo: 'No action needed. Avoid chemically treated plants.',
    requiresEmergencyVisit: false,
    alternatives: ['dandelion', 'chickweed', 'common-mallow'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Purslane is a low-growing succulent weed with thick reddish stems and small yellow flowers. It is safe for pets and is even valued as an edible green.

The succulent leaves can be appealing to curious dogs. Make sure any purslane your pet accesses is free of herbicides and fertilizers.`,
    metaTitle: 'Purslane and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Purslane is safe for dogs and cats. Learn about this succulent weed and how to share it safely.',
  },
  {
    id: 'common-mallow',
    name: 'Common Mallow',
    slug: 'common-mallow',
    scientific_name: 'Malva neglecta',
    aliases: ['cheeses', 'cheeseweed', 'buttonweed'],
    categories: ['outdoor-plants'],
    tags: ['weed', 'safe', 'edible', 'lawn'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe and non-toxic; leaves and flowers are edible.',
    },
    safetyCats: { status: 'safe', summary: 'Safe if chewed in small amounts.' },
    symptoms: [],
    whatToDo: 'No action needed. Choose plants from untreated areas.',
    requiresEmergencyVisit: false,
    alternatives: ['dandelion', 'white-clover', 'purslane'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Common mallow is a low-growing weed with rounded leaves and small pale pink or white flowers. It is safe for pets and humans.

The small seed pods look like tiny cheese wheels, which can amuse foraging pets. As always, chemical-free sources are safest.`,
    metaTitle: 'Common Mallow and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Common mallow is safe for dogs and cats. Learn why this mild lawn weed is non-toxic and pet-friendly.',
  },
  {
    id: 'wild-violet',
    name: 'Wild Violet',
    slug: 'wild-violet',
    scientific_name: 'Viola sororia',
    aliases: ['common blue violet', 'meadow violet', 'hooded violet'],
    categories: ['outdoor-plants'],
    tags: ['wildflower', 'safe', 'lawn', 'native'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe and non-toxic; a welcome lawn wildflower.',
    },
    safetyCats: { status: 'safe', summary: 'Safe if nibbled.' },
    symptoms: [],
    whatToDo: 'No action needed. Avoid chemically treated plants.',
    requiresEmergencyVisit: false,
    alternatives: ['pansy', 'dandelion', 'white-clover'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Wild violets are charming native wildflowers that often dot shaded lawns. They are safe for dogs and cats and add color without posing a poisoning risk.

Pets may occasionally chew the leaves or flowers with no ill effects. Keep violets in untreated areas for the safest snack.`,
    metaTitle: 'Wild Violet and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Wild violets are safe for dogs and cats. Learn about this native lawn wildflower and how to keep it pet-friendly.',
  },
  {
    id: 'red-clover',
    name: 'Red Clover',
    slug: 'red-clover',
    scientific_name: 'Trifolium pratense',
    aliases: ['purple clover', 'meadow clover', 'cow clover'],
    categories: ['outdoor-plants'],
    tags: ['wildflower', 'safe', 'lawn', 'edible'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe and non-toxic; common in meadows and untreated lawns.',
    },
    safetyCats: { status: 'safe', summary: 'Safe in small amounts.' },
    symptoms: [],
    whatToDo: 'No action needed. Ensure the area is free of herbicides.',
    requiresEmergencyVisit: false,
    alternatives: ['white-clover', 'dandelion', 'common-plantain'],
    relatedPlants: ['white-clover'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Red clover is a flowering legume found in meadows, pastures, and lawns. It is safe for pets and provides nectar for pollinators.

Some pets enjoy grazing on clover. Limit access to untreated areas to avoid pesticide exposure.`,
    metaTitle: 'Red Clover and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Red clover is safe for dogs and cats. Learn about this meadow wildflower and pet lawn safety.',
  },
  {
    id: 'wild-strawberry',
    name: 'Wild Strawberry',
    slug: 'wild-strawberry',
    scientific_name: 'Fragaria vesca',
    aliases: ['woodland strawberry', 'alpine strawberry'],
    categories: ['outdoor-plants'],
    tags: ['wildflower', 'safe', 'fruit', 'native'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe; ripe berries are non-toxic and low in sugar.',
    },
    safetyCats: {
      status: 'safe',
      summary: 'Safe if a berry is eaten, though cats rarely seek them.',
    },
    symptoms: [],
    whatToDo: 'No action needed. Offer only ripe berries from untreated plants.',
    requiresEmergencyVisit: false,
    alternatives: ['dandelion', 'white-clover', 'common-plantain'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Wild strawberry plants produce small, aromatic red berries and trifoliate leaves. The ripe fruit is safe for dogs and cats in small amounts.

Because berries are sugary, dogs should eat only a few. Make sure plants have not been sprayed with chemicals.`,
    metaTitle: 'Wild Strawberry and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Wild strawberries are safe for dogs and cats. Learn how to share these low-sugar berries safely.',
  },
  {
    id: 'grass',
    name: 'Grass',
    slug: 'grass',
    scientific_name: 'Poaceae family',
    aliases: ['lawn grass', 'turf grass', 'pasture grass'],
    categories: ['outdoor-plants'],
    tags: ['lawn', 'safe', 'ground-cover', 'grass'],
    safetyDogs: {
      status: 'safe',
      summary: 'Non-toxic; many dogs nibble grass, though it often causes vomiting.',
    },
    safetyCats: {
      status: 'safe',
      summary: 'Safe; indoor and outdoor grass is commonly eaten by cats.',
    },
    symptoms: ['vomiting', 'mild stomach upset'],
    whatToDo:
      'Usually no action is needed. If vomiting is frequent or grass was treated with chemicals, call a vet.',
    requiresEmergencyVisit: false,
    alternatives: ['white-clover', 'dandelion', 'common-plantain'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Plain grass is not toxic to dogs or cats. Many pets eat grass occasionally, possibly to soothe an upset stomach or add fiber. It commonly causes vomiting soon after.

The bigger concern is chemical treatments, fertilizers, and parasites. Use pet-safe lawn products and discourage grazing on unknown turf.`,
    metaTitle: 'Grass and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Plain grass is safe for dogs and cats. Learn why pets eat grass and when lawn chemicals become a concern.',
  },
  {
    id: 'creeping-thyme',
    name: 'Creeping Thyme',
    slug: 'creeping-thyme',
    scientific_name: 'Thymus serpyllum',
    aliases: ['wild thyme', 'mother of thyme', 'breckland thyme'],
    categories: ['outdoor-plants'],
    tags: ['ground-cover', 'safe', 'herb', 'ornamental'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe; often used as a fragrant ground cover between pavers.',
    },
    safetyCats: { status: 'safe', summary: 'Safe in small amounts; non-toxic.' },
    symptoms: [],
    whatToDo: 'No action needed. Enjoy as a lawn alternative.',
    requiresEmergencyVisit: false,
    alternatives: ['white-clover', 'common-plantain', 'dandelion'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Creeping thyme is a low, aromatic herb that forms dense mats. It is safe for pets and can be used as a fragrant, drought-tolerant lawn alternative.

Many dogs enjoy the scent as they walk through it. It is a good choice for pet owners who want ground cover without toxic risks.`,
    metaTitle: 'Creeping Thyme and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Creeping thyme is safe for dogs and cats. Learn why this fragrant ground cover is a pet-friendly lawn alternative.',
  },
  {
    id: 'chamomile',
    name: 'Chamomile',
    slug: 'chamomile',
    scientific_name: 'Matricaria chamomilla',
    aliases: ['german chamomile', 'wild chamomile', 'true chamomile'],
    categories: ['outdoor-plants'],
    tags: ['herb', 'limited', 'flower', 'edible'],
    safetyDogs: {
      status: 'limited',
      severity: 'low',
      summary: 'Mildly toxic in large amounts; can cause vomiting, diarrhea, and skin irritation.',
    },
    safetyCats: {
      status: 'limited',
      severity: 'low',
      summary: 'May cause mild GI upset and allergic reactions in sensitive cats.',
    },
    symptoms: ['vomiting', 'diarrhea', 'skin irritation', 'allergic reaction'],
    whatToDo: 'Stop access to the plant. Contact a vet if symptoms are persistent or severe.',
    requiresEmergencyVisit: false,
    alternatives: ['dandelion', 'calendula', 'catnip'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Chamomile is a calming herb for humans, but concentrated amounts can irritate pets. The fresh plant is generally low risk unless a pet eats a large quantity.

If you grow chamomile, place it where pets cannot graze heavily. Dried chamomile used in teas is usually not a concern in tiny spills.`,
    metaTitle: 'Chamomile and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Chamomile is limited risk for dogs and cats. Learn symptoms of chamomile sensitivity and safer herb choices.',
  },
  {
    id: 'calendula',
    name: 'Calendula',
    slug: 'calendula',
    scientific_name: 'Calendula officinalis',
    aliases: ['pot marigold', 'english marigold', 'scotch marigold'],
    categories: ['outdoor-plants'],
    tags: ['flower', 'safe', 'herb', 'ornamental'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe and often used in natural skin products for dogs.',
    },
    safetyCats: { status: 'safe', summary: 'Non-toxic and safe if nibbled.' },
    symptoms: [],
    whatToDo: 'No action needed. Avoid plants treated with pesticides.',
    requiresEmergencyVisit: false,
    alternatives: ['marigold', 'pansy', 'nasturtium'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Calendula is a bright, daisy-like flower with a long history of use in herbal skincare. It is safe for dogs and cats.

The petals are sometimes added to pet balms. Make sure garden calendulas have not been sprayed with chemicals before letting pets explore them.`,
    metaTitle: 'Calendula and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Calendula is safe for dogs and cats. Learn about this edible flower and its use in pet-safe skin care.',
  },
  {
    id: 'pansy',
    name: 'Pansy',
    slug: 'pansy',
    scientific_name: 'Viola x wittrockiana',
    aliases: ['garden pansy', 'heartsease'],
    categories: ['outdoor-plants'],
    tags: ['flower', 'safe', 'ornamental', 'annual'],
    safetyDogs: { status: 'safe', summary: 'Safe; non-toxic if a few petals are eaten.' },
    safetyCats: { status: 'safe', summary: 'Safe and unlikely to cause any symptoms.' },
    symptoms: [],
    whatToDo: 'No action needed. Avoid chemically treated flowers.',
    requiresEmergencyVisit: false,
    alternatives: ['wild-violet', 'calendula', 'nasturtium'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Pansies are cheerful cool-season flowers with colorful faces. They are safe for pets and are sometimes used as edible garnishes.

Pets that nibble a pansy or two should have no problems. Choose untreated plants, especially those in public planters where chemicals may be used.`,
    metaTitle: 'Pansy and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Pansies are safe for dogs and cats. Learn why these colorful flowers are a worry-free garden choice.',
  },
  {
    id: 'nasturtium',
    name: 'Nasturtium',
    slug: 'nasturtium',
    scientific_name: 'Tropaeolum majus',
    aliases: ['indian cress', 'monks cress'],
    categories: ['outdoor-plants'],
    tags: ['flower', 'safe', 'edible', 'annual'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe; leaves and flowers are edible and often peppery.',
    },
    safetyCats: { status: 'safe', summary: 'Safe in small amounts.' },
    symptoms: [],
    whatToDo: 'No action needed. Limit quantities to avoid stomach upset.',
    requiresEmergencyVisit: false,
    alternatives: ['pansy', 'calendula', 'marigold'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Nasturtiums are trailing or bushy plants with bright flowers and rounded leaves. Both leaves and flowers are safe for pets and humans to eat.

The peppery taste usually limits how much a pet wants. Grow nasturtiums away from chemical sprays for the safest foraging.`,
    metaTitle: 'Nasturtium and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Nasturtiums are safe for dogs and cats. Learn how to grow and share these edible flowers with pets.',
  },
  {
    id: 'marigold',
    name: 'Marigold',
    slug: 'marigold',
    scientific_name: 'Tagetes spp.',
    aliases: ['african marigold', 'french marigold'],
    categories: ['outdoor-plants'],
    tags: ['flower', 'safe', 'ornamental', 'annual'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe; may cause mild stomach upset if a large amount is eaten.',
    },
    safetyCats: {
      status: 'safe',
      summary: 'Non-toxic; large ingestions may cause minor GI upset.',
    },
    symptoms: ['mild vomiting', 'mild diarrhea'],
    whatToDo: 'Usually no action needed. Contact a vet if symptoms persist.',
    requiresEmergencyVisit: false,
    alternatives: ['calendula', 'pansy', 'dandelion'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Marigolds are popular annual flowers with a strong scent. They are generally safe for pets, though some dogs may experience mild stomach upset after eating many flowers.

Marigolds are often planted to repel pests. Use pet-safe pest control methods if your pets frequent marigold beds.`,
    metaTitle: 'Marigold and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Marigolds are safe for dogs and cats. Learn about potential mild stomach upset and how to plant them safely.',
  },
  {
    id: 'sunflower',
    name: 'Sunflower',
    slug: 'sunflower',
    scientific_name: 'Helianthus annuus',
    aliases: ['common sunflower', 'giant sunflower'],
    categories: ['outdoor-plants'],
    tags: ['flower', 'safe', 'seed', 'annual'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe; plain seeds are a common treat, and stalks are non-toxic.',
    },
    safetyCats: {
      status: 'safe',
      summary: 'Safe; sunflower seeds are non-toxic in small amounts.',
    },
    symptoms: [],
    whatToDo: 'No action needed. Offer unsalted, shelled seeds in moderation.',
    requiresEmergencyVisit: false,
    alternatives: ['marigold', 'dandelion', 'white-clover'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Sunflowers are tall, cheerful annuals with large seed heads. The flowers, leaves, and seeds are safe for pets. Unsalted sunflower seeds are a popular dog treat.

Avoid seeds with salt, seasonings, or chocolate coatings. Sunflower stalks can be fibrous and hard to digest, so limit chewing on thick stems.`,
    metaTitle: 'Sunflower and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Sunflowers and plain seeds are safe for dogs and cats. Learn how to share sunflower seeds safely.',
  },
  {
    id: 'catnip',
    name: 'Catnip',
    slug: 'catnip',
    scientific_name: 'Nepeta cataria',
    aliases: ['catmint', 'catwort', 'field balm'],
    categories: ['outdoor-plants'],
    tags: ['herb', 'safe', 'cat-friendly', 'perennial'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe; may cause mild sedation or GI upset in very large amounts.',
    },
    safetyCats: {
      status: 'safe',
      summary: 'Safe and enjoyed by many cats as a stimulating herb.',
    },
    symptoms: ['excitement', 'rolling', 'purring', 'mild sedation'],
    whatToDo: 'No action needed. Offer in moderation.',
    requiresEmergencyVisit: false,
    alternatives: ['mint', 'dandelion', 'white-clover'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Catnip is a member of the mint family famous for its effects on cats. It is safe for both cats and dogs, though dogs usually show little interest.

Cats may roll, rub, or become playful after sniffing catnip. Effects are short-lived and harmless for the vast majority of cats.`,
    metaTitle: 'Catnip and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Catnip is safe for cats and dogs. Learn how catnip affects cats and how to offer it safely.',
  },
  {
    id: 'mint',
    name: 'Mint',
    slug: 'mint',
    scientific_name: 'Mentha spp.',
    aliases: ['peppermint', 'spearmint', 'garden mint'],
    categories: ['outdoor-plants'],
    tags: ['herb', 'safe', 'perennial', 'edible'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe in small amounts; can cause mild stomach upset if overeaten.',
    },
    safetyCats: {
      status: 'safe',
      summary: 'Safe in small amounts; some cats enjoy the scent.',
    },
    symptoms: ['mild vomiting', 'mild diarrhea'],
    whatToDo: 'No action needed for small nibbles. Limit access if a pet eats large amounts.',
    requiresEmergencyVisit: false,
    alternatives: ['catnip', 'dandelion', 'white-clover'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Mint is a fragrant perennial herb that is safe for pets in moderation. Peppermint and spearmint are the most common garden varieties.

Large amounts of mint can cause mild digestive upset. Essential oils are much more concentrated and should never be applied to pets without veterinary guidance.`,
    metaTitle: 'Mint and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Mint is safe for dogs and cats in small amounts. Learn about fresh mint versus concentrated mint oil safety.',
  },
  {
    id: 'bee-balm',
    name: 'Bee Balm',
    slug: 'bee-balm',
    scientific_name: 'Monarda didyma',
    aliases: ['bergamot', 'oswego tea', 'scarlet monarda'],
    categories: ['outdoor-plants'],
    tags: ['wildflower', 'safe', 'perennial', 'native'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe; attracts pollinators and is non-toxic to pets.',
    },
    safetyCats: { status: 'safe', summary: 'Safe if chewed in small amounts.' },
    symptoms: [],
    whatToDo: 'No action needed. Plant freely in pet-friendly gardens.',
    requiresEmergencyVisit: false,
    alternatives: ['echinacea', 'sunflower', 'dandelion'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Bee balm is a native perennial with tufted flowers that attract bees, butterflies, and hummingbirds. It is safe for dogs and cats.

It is an excellent choice for pollinator gardens shared with pets. Deer and rabbits tend to avoid it, which can help protect neighboring plants.`,
    metaTitle: 'Bee Balm and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Bee balm is safe for dogs and cats. Learn why this pollinator favorite belongs in pet-friendly gardens.',
  },
  {
    id: 'echinacea',
    name: 'Echinacea',
    slug: 'echinacea',
    scientific_name: 'Echinacea purpurea',
    aliases: ['coneflower', 'purple coneflower'],
    categories: ['outdoor-plants'],
    tags: ['wildflower', 'safe', 'perennial', 'native'],
    safetyDogs: {
      status: 'safe',
      summary: 'Safe; commonly used in immune supplements for dogs.',
    },
    safetyCats: { status: 'safe', summary: 'Safe in small amounts.' },
    symptoms: [],
    whatToDo: 'No action needed. Use supplements only under veterinary guidance.',
    requiresEmergencyVisit: false,
    alternatives: ['bee-balm', 'sunflower', 'dandelion'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      {
        name: 'American Kennel Club',
        url: 'https://www.akc.org/expert-advice/health/',
      },
    ],
    body: `Echinacea, or coneflower, is a sturdy native perennial with drooping purple petals. It is safe for pets and is popular in herbal immune support products.

While the plant itself is non-toxic, concentrated supplements should be used only as directed by a veterinarian.`,
    metaTitle: 'Echinacea and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Echinacea is safe for dogs and cats. Learn about this native coneflower and safe supplement use.',
  },
  {
    id: 'wood-sorrel',
    name: 'Wood Sorrel',
    slug: 'wood-sorrel',
    scientific_name: 'Oxalis spp.',
    aliases: ['sourgrass', 'shamrock', 'oxalis'],
    categories: ['outdoor-plants'],
    tags: ['weed', 'limited', 'lawn', 'oxalates'],
    safetyDogs: {
      status: 'limited',
      severity: 'low',
      summary: 'Contains oxalates that can irritate the mouth and kidneys in large amounts.',
    },
    safetyCats: {
      status: 'limited',
      severity: 'low',
      summary: 'May cause drooling and mild stomach upset; large ingestions can affect kidneys.',
    },
    symptoms: ['drooling', 'pawing at mouth', 'vomiting', 'diarrhea', 'weakness'],
    whatToDo:
      'Rinse the mouth with water. Contact a vet if large amounts were eaten or symptoms persist.',
    requiresEmergencyVisit: false,
    alternatives: ['white-clover', 'dandelion', 'common-plantain'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Wood sorrel is a low-growing weed with clover-like leaves and tiny yellow flowers. It contains soluble oxalates that can irritate the mouth and kidneys when consumed in quantity.

Most pets will only nibble a few leaves and feel fine. Prevent heavy grazing and remove wood sorrel from areas where pets forage regularly.`,
    metaTitle: 'Wood Sorrel and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Wood sorrel is limited risk for pets due to oxalates. Learn symptoms and safe lawn alternatives.',
  },
  {
    id: 'creeping-charlie',
    name: 'Creeping Charlie',
    slug: 'creeping-charlie',
    scientific_name: 'Glechoma hederacea',
    aliases: ['ground ivy', 'catsfoot', 'alehoof'],
    categories: ['outdoor-plants'],
    tags: ['ground-cover', 'limited', 'lawn', 'herb'],
    safetyDogs: {
      status: 'limited',
      severity: 'low',
      summary: 'May cause mild vomiting or diarrhea if large amounts are ingested.',
    },
    safetyCats: {
      status: 'limited',
      severity: 'low',
      summary: 'Generally low risk; large ingestions may cause stomach upset.',
    },
    symptoms: ['vomiting', 'diarrhea', 'drooling'],
    whatToDo: 'Stop access. Contact a vet if symptoms are severe or prolonged.',
    requiresEmergencyVisit: false,
    alternatives: ['white-clover', 'creeping-thyme', 'dandelion'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Creeping Charlie is a fast-spreading ground cover with scalloped leaves and small purple flowers. It is mildly aromatic and generally low risk for pets.

Some pets may vomit if they eat a lot of it. Keeping this plant under control in pet play areas reduces the chance of overconsumption.`,
    metaTitle: 'Creeping Charlie and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Creeping Charlie is limited risk for pets. Learn symptoms of mild stomach upset and how to manage this ground cover.',
  },
  {
    id: 'yarrow',
    name: 'Yarrow',
    slug: 'yarrow',
    scientific_name: 'Achillea millefolium',
    aliases: ['milfoil', 'nosebleed plant', "old man's pepper"],
    categories: ['outdoor-plants'],
    tags: ['wildflower', 'limited', 'herb', 'native'],
    safetyDogs: {
      status: 'limited',
      severity: 'low',
      summary: 'May cause vomiting, diarrhea, or skin irritation in sensitive dogs.',
    },
    safetyCats: {
      status: 'limited',
      severity: 'low',
      summary: 'Large ingestions may cause mild GI upset.',
    },
    symptoms: ['vomiting', 'diarrhea', 'skin irritation'],
    whatToDo: 'Stop exposure. Contact a vet if symptoms are severe or persistent.',
    requiresEmergencyVisit: false,
    alternatives: ['echinacea', 'bee-balm', 'dandelion'],
    sources: [
      {
        name: 'ASPCA',
        url: 'https://www.aspca.org/pet-care/animal-poison-control',
      },
      { name: 'Pet Poison Helpline', url: 'https://www.petpoisonhelpline.com/' },
    ],
    body: `Yarrow is a hardy perennial with fern-like leaves and flat flower clusters. It is used in herbal medicine but can irritate some pets.

Most animals tolerate light contact. Heavy ingestion, especially of dried yarrow, is more likely to cause digestive upset than fresh grazing.`,
    metaTitle: 'Yarrow and Pets — Safety Guide | PetPilot',
    metaDescription:
      'Yarrow is limited risk for pets. Learn symptoms of yarrow sensitivity and safer native wildflowers.',
  },
]
