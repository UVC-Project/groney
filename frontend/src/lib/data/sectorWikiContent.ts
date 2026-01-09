// Educational content for each sector type
// Used by wiki pages when QR codes are scanned

export interface SectorWikiContent {
  type: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  heroImage?: string;
  introduction: string;
  funFacts: string[];
  activities: { title: string; description: string; emoji: string }[];
  didYouKnow: string;
  careGuide: { title: string; steps: string[] };
}

export const sectorWikiContent: Record<string, SectorWikiContent> = {
  TREES: {
    type: 'TREES',
    emoji: '🌳',
    title: 'Trees & Forest',
    subtitle: 'The lungs of our schoolyard!',
    color: '#22c55e',
    introduction:
      'Trees are super important for our planet! They make oxygen so we can breathe, give shade on hot days, and are home to many animals.',
    funFacts: [
      'A large tree makes enough oxygen for 4 people per day! 🌬️',
      'Trees can live for hundreds of years - some even thousands! 🎂',
      'The roots of a tree can be as big as the crown above 🌱',
      'Trees "talk" to each other through fungi underground 🍄',
      'There are over 3 trillion trees on Earth! 🌍',
    ],
    activities: [
      {
        title: 'Tree Detective',
        description: 'Count the rings on a tree stump to discover how old the tree was!',
        emoji: '🔍',
      },
      {
        title: 'Leaf Collection',
        description: 'Collect different leaves and make artwork with them.',
        emoji: '🍂',
      },
      {
        title: 'Tree Hug',
        description: 'Hug a tree and feel how rough or smooth the bark is!',
        emoji: '🤗',
      },
    ],
    didYouKnow:
      'Did you know that trees in cities can lower the temperature by up to 8 degrees? That\'s why it feels so nice to sit in the shade of a tree on a hot day!',
    careGuide: {
      title: 'How to Help Trees',
      steps: [
        'Water young trees when it\'s been dry for a long time',
        'Don\'t throw trash near the roots',
        'Don\'t break off branches',
        'Plant new trees in autumn',
      ],
    },
  },
  FLOWERS: {
    type: 'FLOWERS',
    emoji: '🌸',
    title: 'Flowers & Plants',
    subtitle: 'A colorful paradise for bees and butterflies!',
    color: '#ec4899',
    introduction:
      'Flowers make our schoolyard beautiful AND help insects like bees and butterflies. Without flowers, bees couldn\'t make honey!',
    funFacts: [
      'Bees visit up to 5000 flowers per day! 🐝',
      'Some flowers only open during the day and close at night 🌙',
      'The largest flower in the world (Rafflesia) smells like rotting meat! 🤢',
      'Sunflowers turn to follow the sun ☀️',
      'There are more than 400,000 species of flowers on Earth 🌍',
    ],
    activities: [
      {
        title: 'Build a Bee Hotel',
        description: 'Make a home for wild bees using bamboo and wood.',
        emoji: '🏠',
      },
      {
        title: 'Press Flowers',
        description: 'Press flowers between books and make cards with them.',
        emoji: '📚',
      },
      {
        title: 'Butterfly Count',
        description: 'Count how many different butterflies you see near the flowers.',
        emoji: '🦋',
      },
    ],
    didYouKnow:
      'Did you know that some flowers can only be pollinated by certain insects? The flower and insect fit together perfectly, like a key in a lock!',
    careGuide: {
      title: 'How to Help Flowers',
      steps: [
        'Water at the roots, not on the flowers',
        'Remove dead flowers so new ones can grow',
        'Plant flowers that bees and butterflies love',
        'Leave some "weeds" - they\'re flowers too!',
      ],
    },
  },
  POND: {
    type: 'POND',
    emoji: '🦆',
    title: 'Pond & Water',
    subtitle: 'A world underwater!',
    color: '#3b82f6',
    introduction:
      'Water is life! In and around the pond live frogs, dragonflies, water beetles, and maybe even fish. It\'s a mini ecosystem full of surprises.',
    funFacts: [
      'Frogs can breathe through their skin! 🐸',
      'Dragonflies have existed for 300 million years - longer than dinosaurs! 🦖',
      'Water plants make oxygen for the fish 🌿',
      'A frog can jump 20 times its own body length! 🏃',
      'Some water beetles can take an air bubble underwater with them 💨',
    ],
    activities: [
      {
        title: 'Find Tadpoles',
        description: 'Look in spring to see if you can spot tadpoles!',
        emoji: '🔎',
      },
      {
        title: 'Pond Dipping',
        description: 'Carefully scoop some water and look at the tiny creatures.',
        emoji: '🥄',
      },
      {
        title: 'Dragonfly Spotting',
        description: 'Count how many different colored dragonflies you see.',
        emoji: '✨',
      },
    ],
    didYouKnow:
      'Did you know that a frog starts as a fish-like creature with a tail (tadpole) and slowly grows legs? This is called metamorphosis - a complete transformation!',
    careGuide: {
      title: 'How to Help the Pond',
      steps: [
        'Never throw trash in the water',
        'Let water plants grow for oxygen',
        'Remove excess duckweed so light can reach the water',
        'Don\'t release goldfish - they eat all the tadpoles!',
      ],
    },
  },
  ANIMALS: {
    type: 'ANIMALS',
    emoji: '🐾',
    title: 'Animals & Insects',
    subtitle: 'Our little schoolyard residents!',
    color: '#f59e0b',
    introduction:
      'Many more animals live in our schoolyard than you might think! From hedgehogs and birds to beetles and worms - they all have an important job.',
    funFacts: [
      'A hedgehog eats up to 200 slugs per night! 🦔',
      'Worms make the soil healthy by digging 🪱',
      'Ladybugs eat aphids - they\'re real garden helpers! 🐞',
      'Birds can see colors that we can\'t see 🌈',
      'Ants can lift 50 times their own weight! 💪',
    ],
    activities: [
      {
        title: 'Check the Bug Hotel',
        description: 'See which insects are living in the bug hotel.',
        emoji: '🏨',
      },
      {
        title: 'Bird Song ID',
        description: 'Listen to the birds and try to identify them.',
        emoji: '🎵',
      },
      {
        title: 'Track Finding',
        description: 'Look for footprints, feathers, or other animal signs.',
        emoji: '👣',
      },
    ],
    didYouKnow:
      'Did you know that earthworms don\'t have eyes but can still sense light? They quickly crawl back into the ground when it gets too bright!',
    careGuide: {
      title: 'How to Help Animals',
      steps: [
        'Leave a corner of the garden "wild" for hiding spots',
        'Put out a dish of water for birds and hedgehogs',
        'Don\'t make noise near animal nests',
        'Hang up birdhouses and bug hotels',
      ],
    },
  },
  GARDEN: {
    type: 'GARDEN',
    emoji: '🥕',
    title: 'Vegetable Garden',
    subtitle: 'From seed to your plate!',
    color: '#f97316',
    introduction:
      'In the vegetable garden, you learn where our food comes from. You plant a tiny seed and after a few weeks, you can harvest and eat your own vegetables!',
    funFacts: [
      'A tomato is actually a fruit, not a vegetable! 🍅',
      'Carrots used to be purple, not orange! 🥕',
      'Strawberries are the only fruit with seeds on the outside 🍓',
      'Pumpkins can weigh up to 500 kilograms! 🎃',
      'Cucumbers are 96% water 💧',
    ],
    activities: [
      {
        title: 'Sow and Grow',
        description: 'Plant your own seeds and watch them grow.',
        emoji: '🌱',
      },
      {
        title: 'Harvest Time',
        description: 'Pick ripe vegetables and fruits when they\'re ready.',
        emoji: '🧺',
      },
      {
        title: 'Taste Test',
        description: 'Taste what you\'ve harvested - fresh tastes best!',
        emoji: '😋',
      },
    ],
    didYouKnow:
      'Did you know that from one sunflower seed you can grow a plant with up to 2000 new seeds? That\'s enough to plant a whole football field!',
    careGuide: {
      title: 'How to Help the Garden',
      steps: [
        'Water a little every day, preferably early morning',
        'Pull weeds so your plants have room',
        'Use compost to keep the soil healthy',
        'Rotate what you plant each year (crop rotation)',
      ],
    },
  },
  PLAYGROUND: {
    type: 'PLAYGROUND',
    emoji: '🎪',
    title: 'Playground',
    subtitle: 'Move and have fun!',
    color: '#a855f7',
    introduction:
      'The playground is where we can run, climb, and play. But did you know that playing is also good for your brain? You learn from it!',
    funFacts: [
      'Kids who play outside are more creative! 🎨',
      'Climbing is good for your balance and strength 💪',
      'Playing together teaches you teamwork 🤝',
      'After playing, you can concentrate better in class 📚',
      'Laughing while playing releases happy hormones! 😄',
    ],
    activities: [
      {
        title: 'Nature Scavenger Hunt',
        description: 'Look for special nature items while playing.',
        emoji: '🔍',
      },
      {
        title: 'Outdoor Games',
        description: 'Play tag, hide and seek, or make up your own game!',
        emoji: '🏃',
      },
      {
        title: 'Quiet Corner',
        description: 'Find a peaceful spot to read or chat.',
        emoji: '📖',
      },
    ],
    didYouKnow:
      'Did you know that by playing outside you make vitamin D? You need that for strong bones. The sun helps your body make this vitamin!',
    careGuide: {
      title: 'How to Keep It Fun',
      steps: [
        'Clean up your trash after playing',
        'Share the play equipment with others',
        'Watch out for younger kids',
        'Report it if something is broken',
      ],
    },
  },
  COMPOST: {
    type: 'COMPOST',
    emoji: '♻️',
    title: 'Compost Heap',
    subtitle: 'Waste becomes plant food!',
    color: '#84cc16',
    introduction:
      'On the compost heap, green waste turns into super food for plants. Worms and bacteria do all the work - they turn peels and leaves into new soil!',
    funFacts: [
      'Compost worms can eat their own weight in waste every day! 🪱',
      'Good compost smells like forest, not like rot 🌲',
      'Composting reduces waste by up to 30%! 📉',
      'The temperature in a compost heap can reach 70°C! 🌡️',
      'Compost is "black gold" for gardeners 🏆',
    ],
    activities: [
      {
        title: 'Feed the Compost',
        description: 'Bring vegetable and fruit scraps to the compost heap.',
        emoji: '🍌',
      },
      {
        title: 'Worm Hunt',
        description: 'Dig carefully and count how many worms you find.',
        emoji: '🔢',
      },
      {
        title: 'Use the Compost',
        description: 'Spread finished compost on the plants in the garden.',
        emoji: '🌱',
      },
    ],
    didYouKnow:
      'Did you know that in one teaspoon of compost there are more than a billion bacteria? They\'re all working hard to turn waste into nutrients!',
    careGuide: {
      title: 'How to Make Good Compost',
      steps: [
        'Add vegetables, fruit, and garden waste to the heap',
        'No meat, fish, or cooked food!',
        'Mix it up sometimes for air',
        'Keep it moist but not too wet',
      ],
    },
  },
  OTHER: {
    type: 'OTHER',
    emoji: '📍',
    title: 'Special Spot',
    subtitle: 'Discover what\'s special here!',
    color: '#64748b',
    introduction:
      'Every spot in the schoolyard is special! Look around carefully and discover what there is to see and experience at this special place.',
    funFacts: [
      'Every square meter of garden contains thousands of living creatures! 🔬',
      'Plants communicate with each other through scents 👃',
      'Nature changes a little bit every day 🔄',
      'Even a small corner can be a whole ecosystem 🌍',
      'Sitting still and watching teaches you the most about nature 👀',
    ],
    activities: [
      {
        title: 'Nature Journal',
        description: 'Write or draw what you see here.',
        emoji: '📓',
      },
      {
        title: 'Sound Safari',
        description: 'Close your eyes and listen to all the sounds.',
        emoji: '👂',
      },
      {
        title: 'Photo Safari',
        description: 'Take a photo of something special you discover.',
        emoji: '📸',
      },
    ],
    didYouKnow:
      'Did you know that scientists still discover new species, even in ordinary gardens? Maybe you\'ll discover something new too!',
    careGuide: {
      title: 'How to Discover More',
      steps: [
        'Take time to look carefully',
        'Ask questions about what you see',
        'Come back at different times',
        'Share your discoveries with others',
      ],
    },
  },
};

export function getSectorWikiContent(type: string): SectorWikiContent | null {
  return sectorWikiContent[type.toUpperCase()] || null;
}

export const allSectorTypes = Object.keys(sectorWikiContent);
