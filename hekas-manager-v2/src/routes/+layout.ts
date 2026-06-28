import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
  return {
    session: {
      name: 'Siti Wahyuni',
      role: 'Manager',
      outlet: 'HEKAS Pandeansari'
    }
  };
};