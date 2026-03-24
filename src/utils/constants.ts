export const CATEGORIES = {
  sleep: {
    key: 'sleep',
    label: 'SLEEP',
    color: '--cat-sleep',
    hex: '#5B8FF9',
  },
  productivity: {
    key: 'productivity',
    label: 'PRODUCTIVITY',
    color: '--cat-productivity',
    hex: '#E866A0',
  },
  fitness: {
    key: 'fitness',
    label: 'FITNESS',
    color: '--cat-fitness',
    hex: '#43BF4D',
  },
  career: {
    key: 'career',
    label: 'CAREER',
    color: '--cat-career',
    hex: '#9B72F2',
  },
  health: {
    key: 'health',
    label: 'HEALTH',
    color: '--cat-health',
    hex: '#29A634',
  },
  learning: {
    key: 'learning',
    label: 'LEARNING',
    color: '--cat-learning',
    hex: '#F7C948',
  },
  mindset: {
    key: 'mindset',
    label: 'MINDSET',
    color: '--cat-mindset',
    hex: '#36CFC9',
  },
  custom: {
    key: 'custom',
    label: 'CUSTOM',
    color: '--cat-custom',
    hex: '#8F99A8',
  },
};

export const DEFAULT_HABITS = [
  { name: 'Wake Up On Time', category: 'sleep' },
  { name: 'No Scrolling', category: 'productivity' },
  { name: 'Morning Planning', category: 'productivity' },
  { name: 'Daily Movement', category: 'fitness' },
  { name: '2L of Water', category: 'health' },
  { name: 'Deep Work Blocks', category: 'career' },
  { name: 'Eat Healthy Food', category: 'health' },
  { name: 'Read 10 Pages', category: 'learning' },
  { name: 'Complete Tasks', category: 'productivity' },
  { name: 'Journal — 3 Lines', category: 'mindset' },
  { name: 'Evening Reflection', category: 'mindset' },
  { name: 'Plan Next Week', category: 'productivity' },
  { name: 'Go To Bed On Time', category: 'sleep' },
];

export const SETTINGS_DEFAULTS = {
  weekStartsOn: 'monday',
  streakThreshold: 80,
};
