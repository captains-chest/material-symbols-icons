import type { Type } from '@angular/core';
import { storyNameFromExport, toId } from 'storybook/internal/csf';

export type IconVariant = 'outline' | 'filled';

export interface IconVariantEntry {
  component: Type<unknown>;
  /** Kept as a string because class names are minified in production builds. */
  className: string;
}

export type IconEntry = Partial<Record<IconVariant, IconVariantEntry>>;
export type IconGroup = Record<string, IconEntry>;

export const PACKAGES: Record<IconVariant, { name: string; prefix: string; label: string }> = {
  outline: {
    name: '@captains-chest/material-symbols-rounded-icons',
    prefix: 'msr',
    label: 'Outline',
  },
  filled: {
    name: '@captains-chest/material-symbols-rounded-icons-filled',
    prefix: 'msrf',
    label: 'Filled',
  },
};

/** Must match the grouping in tools/icons/emit-icon-stories.mjs. */
export function iconGroupOf(name: string): string {
  return /^[0-9]/.test(name) ? '0-9' : name.charAt(0).toLowerCase();
}

export function kebabName(name: string): string {
  return name.replaceAll('_', '-');
}

/** Title of the generated story file that holds an icon. Must match tools/icons/emit-icon-stories.mjs. */
export function iconGroupTitle(name: string): string {
  const group = iconGroupOf(name);
  return `Icons/${group === '0-9' ? group : group.toUpperCase()}`;
}

/** Storybook id of the generated story for an icon; its export is named after the icon. */
export function iconStoryId(name: string): string {
  return toId(iconGroupTitle(name), storyNameFromExport(name));
}

/** Link that opens a story in the Storybook manager from inside the preview iframe. */
export function storyHref(storyId: string): string {
  return `./?path=/story/${storyId}`;
}

export const CATALOG_STORY_ID = 'catalog--all-icons';

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
