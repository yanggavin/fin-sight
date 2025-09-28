export interface FishSpecies {
  id: string;
  name: string;
  scientificName: string;
  commonNames: string[];
  description: string;
  habitat: string[];
  avgLength: string;
  avgWeight: string;
  season: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tips: string[];
  imageUrl?: string;
}

export interface IdentificationResult {
  species: FishSpecies;
  confidence: number;
  alternativeMatches?: {
    species: FishSpecies;
    confidence: number;
  }[];
  photoAnalysis: {
    imageQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    detectedFeatures: string[];
    recommendations?: string[];
  };
}

// Fish database - in a real app, this would come from an API or local database
const FISH_DATABASE: FishSpecies[] = [
  {
    id: 'largemouth-bass',
    name: 'Largemouth Bass',
    scientificName: 'Micropterus salmoides',
    commonNames: ['Largemouth Bass', 'Black Bass', 'Bigmouth Bass'],
    description: 'The largemouth bass is a carnivorous freshwater gamefish in the Centrarchidae family. It is the state fish of Alabama, Georgia, Mississippi, and Tennessee.',
    habitat: ['Lakes', 'Ponds', 'Rivers', 'Reservoirs'],
    avgLength: '12-16 inches',
    avgWeight: '1-5 lbs',
    season: ['Spring', 'Summer', 'Fall'],
    difficulty: 'Medium',
    tips: [
      'Best caught during dawn and dusk',
      'Use spinnerbaits or plastic worms',
      'Target structure like fallen trees or weed beds',
      'Look for shallow water during spawning season'
    ]
  },
  {
    id: 'rainbow-trout',
    name: 'Rainbow Trout',
    scientificName: 'Oncorhynchus mykiss',
    commonNames: ['Rainbow Trout', 'Steelhead', 'Redband Trout'],
    description: 'Rainbow trout are species of trout and salmon native to cold-water tributaries of the Pacific Ocean in Asia and North America.',
    habitat: ['Streams', 'Rivers', 'Lakes', 'Cold Water'],
    avgLength: '10-14 inches',
    avgWeight: '0.5-2 lbs',
    season: ['Spring', 'Fall', 'Winter'],
    difficulty: 'Medium',
    tips: [
      'Use small spinners or flies',
      'Fish in cold, oxygenated water',
      'Early morning and evening are best',
      'Try near tributaries and inflows'
    ]
  },
  {
    id: 'smallmouth-bass',
    name: 'Smallmouth Bass',
    scientificName: 'Micropterus dolomieu',
    commonNames: ['Smallmouth Bass', 'Bronze Bass', 'Brown Bass'],
    description: 'The smallmouth bass is a species of freshwater fish in the sunfish family of the order Perciformes.',
    habitat: ['Rocky Lakes', 'Rivers', 'Clear Water'],
    avgLength: '10-14 inches',
    avgWeight: '1-3 lbs',
    season: ['Spring', 'Summer', 'Fall'],
    difficulty: 'Hard',
    tips: [
      'Target rocky areas and drop-offs',
      'Use jigs and crankbaits',
      'Fight harder than largemouth bass',
      'Prefer cooler, clearer water'
    ]
  },
  {
    id: 'northern-pike',
    name: 'Northern Pike',
    scientificName: 'Esox lucius',
    commonNames: ['Northern Pike', 'Pike', 'Jackfish'],
    description: 'The northern pike is a species of carnivorous fish of the genus Esox. They are typical of brackish and fresh waters of the Northern Hemisphere.',
    habitat: ['Weedy Lakes', 'Rivers', 'Shallow Bays'],
    avgLength: '18-24 inches',
    avgWeight: '2-8 lbs',
    season: ['Spring', 'Fall', 'Winter'],
    difficulty: 'Hard',
    tips: [
      'Use large spoons or live bait',
      'Target weed edges and structure',
      'Use steel leaders to prevent bite-offs',
      'Fish shallow water in spring and fall'
    ]
  },
  {
    id: 'channel-catfish',
    name: 'Channel Catfish',
    scientificName: 'Ictalurus punctatus',
    commonNames: ['Channel Catfish', 'Channel Cat'],
    description: 'The channel catfish is North America\'s most numerous catfish species. It is the official fish of Kansas, Missouri, Iowa, Nebraska, and Tennessee.',
    habitat: ['Rivers', 'Lakes', 'Ponds', 'Streams'],
    avgLength: '12-20 inches',
    avgWeight: '1-4 lbs',
    season: ['Spring', 'Summer', 'Fall'],
    difficulty: 'Easy',
    tips: [
      'Use stink baits or nightcrawlers',
      'Fish on or near the bottom',
      'Best during warm weather',
      'Look for deep holes and current breaks'
    ]
  },
  {
    id: 'bluegill',
    name: 'Bluegill',
    scientificName: 'Lepomis macrochirus',
    commonNames: ['Bluegill', 'Bream', 'Blue Sunfish'],
    description: 'The bluegill is a species of freshwater fish sometimes referred to as "bream," "brim," "sunny," or "copper nose."',
    habitat: ['Ponds', 'Lakes', 'Slow Rivers'],
    avgLength: '6-8 inches',
    avgWeight: '0.25-0.5 lbs',
    season: ['Spring', 'Summer', 'Fall'],
    difficulty: 'Easy',
    tips: [
      'Use small hooks and live bait',
      'Target shallow water during spawning',
      'Great for beginners',
      'Look for beds in sandy or gravel areas'
    ]
  },
  {
    id: 'redfish',
    name: 'Red Drum',
    scientificName: 'Sciaenops ocellatus',
    commonNames: ['Red Drum', 'Redfish', 'Channel Bass'],
    description: 'The red drum is a game fish found in the Atlantic Ocean from Massachusetts to Florida and in the Gulf of Mexico from Florida to northern Mexico.',
    habitat: ['Saltwater', 'Coastal Waters', 'Estuaries', 'Surf'],
    avgLength: '20-30 inches',
    avgWeight: '5-15 lbs',
    season: ['Spring', 'Summer', 'Fall'],
    difficulty: 'Medium',
    tips: [
      'Use cut bait or live shrimp',
      'Target shallow flats and grass beds',
      'Look for tailing fish in shallow water',
      'Fish during moving tides'
    ]
  }
];

class FishIdentificationService {
  private apiEndpoint: string | null = null;

  // Initialize with API endpoint (for future AI integration)
  initialize(apiEndpoint?: string) {
    this.apiEndpoint = apiEndpoint || null;
  }

  // Simulate AI identification - in production, this would call an actual AI service
  async identifyFish(imageUri: string): Promise<IdentificationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For demo purposes, randomly select a fish with varying confidence
    const randomIndex = Math.floor(Math.random() * FISH_DATABASE.length);
    const primaryMatch = FISH_DATABASE[randomIndex];
    const confidence = 0.75 + Math.random() * 0.2; // 75-95% confidence

    // Generate alternative matches
    const alternativeMatches = FISH_DATABASE
      .filter((_, index) => index !== randomIndex)
      .slice(0, 2)
      .map(species => ({
        species,
        confidence: Math.random() * 0.7 // Lower confidence for alternatives
      }))
      .sort((a, b) => b.confidence - a.confidence);

    // Analyze image quality (simulated)
    const imageQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 
      Math.random() > 0.8 ? 'Excellent' :
      Math.random() > 0.6 ? 'Good' :
      Math.random() > 0.3 ? 'Fair' : 'Poor';

    const detectedFeatures = this.generateDetectedFeatures(primaryMatch);
    const recommendations = this.generateRecommendations(imageQuality);

    return {
      species: primaryMatch,
      confidence,
      alternativeMatches,
      photoAnalysis: {
        imageQuality,
        detectedFeatures,
        recommendations
      }
    };
  }

  private generateDetectedFeatures(species: FishSpecies): string[] {
    const features = [];
    
    if (species.name.includes('Bass')) {
      features.push('Large mouth', 'Spiny dorsal fin', 'Olive coloration');
    } else if (species.name.includes('Trout')) {
      features.push('Spotted pattern', 'Streamlined body', 'Rainbow coloration');
    } else if (species.name.includes('Pike')) {
      features.push('Elongated body', 'Sharp teeth', 'Duck-like snout');
    } else if (species.name.includes('Catfish')) {
      features.push('Whiskers (barbels)', 'No scales', 'Flat head');
    } else if (species.name.includes('Bluegill')) {
      features.push('Disk-shaped body', 'Dark gill flap', 'Small mouth');
    } else {
      features.push('Distinctive fin pattern', 'Characteristic body shape', 'Species-specific coloration');
    }

    return features;
  }

  private generateRecommendations(imageQuality: string): string[] | undefined {
    if (imageQuality === 'Poor' || imageQuality === 'Fair') {
      return [
        'Try taking photo in better lighting',
        'Get closer to the fish',
        'Ensure fish is in focus',
        'Avoid shadows and reflections'
      ];
    }
    return undefined;
  }

  // Get fish species by ID
  getSpeciesById(id: string): FishSpecies | null {
    return FISH_DATABASE.find(fish => fish.id === id) || null;
  }

  // Search fish species by name
  searchSpecies(query: string): FishSpecies[] {
    const lowercaseQuery = query.toLowerCase();
    return FISH_DATABASE.filter(fish => 
      fish.name.toLowerCase().includes(lowercaseQuery) ||
      fish.commonNames.some(name => name.toLowerCase().includes(lowercaseQuery)) ||
      fish.scientificName.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get all available species
  getAllSpecies(): FishSpecies[] {
    return [...FISH_DATABASE];
  }

  // Get species by habitat
  getSpeciesByHabitat(habitat: string): FishSpecies[] {
    return FISH_DATABASE.filter(fish => 
      fish.habitat.some(h => h.toLowerCase().includes(habitat.toLowerCase()))
    );
  }

  // Get species by difficulty
  getSpeciesByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): FishSpecies[] {
    return FISH_DATABASE.filter(fish => fish.difficulty === difficulty);
  }
}

export const fishIdentificationService = new FishIdentificationService();