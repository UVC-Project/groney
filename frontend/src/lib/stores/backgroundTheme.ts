import { writable } from 'svelte/store';

export type BackgroundOption = {
  id: number;
  name: string;
  className: string;
};

export const backgroundOptions: BackgroundOption[] = [
  {
    id: 1,
    name: 'Spring',
    className: 'bg-gradient-to-b from-sky-blue-light to-grass-green-light'
  },
  {
    id: 2,
    name: 'Sunset',
    className: 'bg-gradient-to-b from-orange-300 to-pink-400'
  },
  {
    id: 3,
    name: 'Forest',
    className: 'bg-gradient-to-b from-emerald-500 to-lime-400'
  },
  {
    id: 4,
    name: 'Dark',
    className: 'bg-gradient-to-b from-black to-gray-500'
  }
];

export const selectedBackground = writable<BackgroundOption>(backgroundOptions[0]);