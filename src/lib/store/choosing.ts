import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Get the value out of storage on load.
let stored: string[] | '*' = '*';
if (browser) {
	stored = localStorage !== undefined ? JSON.parse(localStorage.selectedStore) : '*';
}

export const selectedStore = writable(stored || '[]');

// Anytime the store changes, update the local storage value.
if (browser)
	selectedStore.subscribe((value) => (localStorage.selectedStore = JSON.stringify(value)));
