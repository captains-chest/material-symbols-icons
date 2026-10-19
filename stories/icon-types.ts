import type { Type } from '@angular/core';
import { storyNameFromExport, toId } from 'storybook/internal/csf';

export type IconStyle = 'rounded' | 'outlined' | 'sharp';

/** A published package; matches the target ids in tools/icons/upstream.json. */
export type IconVariant = IconStyle | `${IconStyle}-filled`;

export interface IconVariantEntry {
  component: Type<unknown>;
  /** Kept as a string because class names are minified in production builds. */
  className: string;
}

export type IconEntry = Partial<Record<IconVariant, IconVariantEntry>>;
export type IconGroup = Record<string, IconEntry>;

export interface IconPackage {
  name: string;
  prefix: string;
  label: string;
}

export const STYLES: {
  value: IconStyle;
  label: string;
  unfilled: IconVariant;
  filled: IconVariant;
}[] = [
  { value: 'rounded', label: 'Rounded', unfilled: 'rounded', filled: 'rounded-filled' },
  { value: 'outlined', label: 'Outlined', unfilled: 'outlined', filled: 'outlined-filled' },
  { value: 'sharp', label: 'Sharp', unfilled: 'sharp', filled: 'sharp-filled' },
];

/** Package names and selector prefixes follow tools/icons/upstream.json (msr, msrf, mso, msof, mss, mssf). */
const iconPackage = (style: IconStyle, label: string, filled: boolean): IconPackage => ({
  name: `@captains-chest/material-symbols-${style}-icons${filled ? '-filled' : ''}`,
  prefix: `ms${style.charAt(0)}${filled ? 'f' : ''}`,
  label: filled ? `${label} Filled` : label,
});

export const PACKAGES = Object.fromEntries(
  STYLES.flatMap(({ value, label, unfilled, filled }) => [
    [unfilled, iconPackage(value, label, false)],
    [filled, iconPackage(value, label, true)],
  ]),
) as Record<IconVariant, IconPackage>;

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
