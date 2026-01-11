export type IntroContent = {
  title: string;
  subtitle?: string;
  bullets: string[];
  tipText?: string;
  emoji?: string;
};

export const pageIntros: Record<string, IntroContent> = {
  '/': {
    emoji: '🏠',
    title: 'This is your Groeny Home',
    subtitle: 'Here you can track Groeny and your class progress.',
    bullets: [
      'Check Groeny’s stats (health, thirst, happiness…).',
      'Earn coins by completing missions.',
      'See class activity in “Recent activities”.'
    ],
    tipText: 'Do at least one mission daily to keep your streak alive!'
  },

  '/map': {
    emoji: '🗺️',
    title: 'Welcome to the Map',
    subtitle: 'This is where you explore areas and find missions.',
    bullets: [
      'Explore different zones of the schoolyard.',
      'Tap a sector to see available missions.',
      'Complete missions to unlock progress and rewards.'
    ],
    tipText: 'Start with the easiest mission to build momentum.'
  },

  '/wardrobe': {
    emoji: '🧢',
    title: 'Welcome to Wardrobe',
    subtitle: 'Customize Groeny with items you’ve earned.',
    bullets: [
      'Equip hats and accessories for Groeny.',
      'Try different combinations to see what looks best.',
      'Some items may require a certain level or coins.'
    ],
    tipText: 'Save coins for rare items later!'
  },

  '/shop': {
    emoji: '🛒',
    title: 'Welcome to the Shop',
    subtitle: 'Spend coins to buy items and upgrades.',
    bullets: [
      'Browse items you can purchase with coins.',
      'Buy upgrades that help Groeny or your progress.',
      'Check requirements (level/coins) before buying.'
    ],
    tipText: 'Don’t spend everything—keep some coins for emergencies.'
  },

  '/supplies': {
    emoji: '🌿',
    title: 'Welcome to Supplies',
    subtitle: 'Find resources and suppliers that support your green schoolyard.',
    bullets: [
      'Discover tools/materials for green maintenance.',
      'Learn what each supplier provides.',
      'Use this info for class projects and planning.'
    ],
    tipText: 'Use suppliers info when your teacher assigns a real-life task.'
  },

  '/wiki': {
    emoji: '📚',
    title: 'Welcome to the Wiki',
    subtitle: 'Learn and level up your green knowledge.',
    bullets: [
      'Read short guides about nature and sustainability.',
      'Learn terms related to gardening and ecosystems.',
      'Use the wiki to help with mission decisions.'
    ],
<<<<<<< Updated upstream
    tipText: 'If you’re stuck on a mission, the wiki often has the answer.'
=======
    tipText: "If you're stuck on a mission, the wiki often has the answer."
  },

  '/profile': {
    emoji: '👤',
    title: 'Welcome to Your Profile',
    subtitle: 'Manage your account information and settings.',
    bullets: [
      'Update your name and username.',
      'Change your password to keep your account safe.',
      'All your information is private and secure.'
    ],
    tipText: 'Keep your password safe and don\'t share it with anyone!'
>>>>>>> Stashed changes
  }
};
