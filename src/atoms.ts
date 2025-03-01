import { atom, getDefaultStore } from 'jotai';

///////////

export const lineWidthAtom = atom(2);
export function getLineWidth() {
    const defaultStore = getDefaultStore();
    return defaultStore.get(lineWidthAtom);
};

export const showDotsAtom = atom(false);
export function getShowDots() {
    const defaultStore = getDefaultStore();
    return defaultStore.get(showDotsAtom);
};

export const smoothingTypeAtom = atom<'linear' | 'chaikin'>('linear'); 
export function getSmoothingType() {
    const defaultStore = getDefaultStore();
    return defaultStore.get(smoothingTypeAtom);
};