// Renders the built packages with Angular SSR (JIT) and checks the public rendering contract:
// ariaLabel through templates, ComponentRef.setInput and NgComponentOutlet, plus shared styles.
// Run after `pnpm build:lib`.
import '@angular/compiler';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'vite-plus/test';
import { pathToFileURL } from 'node:url';
import { NgComponentOutlet } from '@angular/common';
import { Component, CSP_NONCE, inject, provideZonelessChangeDetection, ViewContainerRef } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';

const variants = [
  { id: 'outline', dist: 'dist/material-symbols-rounded-icons', prefix: 'msr', classPrefix: 'Msr' },
  { id: 'filled', dist: 'dist/material-symbols-rounded-icons-filled', prefix: 'msrf', classPrefix: 'Msrf' },
];

async function loadPackage(distDir) {
  const fesmDir = path.resolve(distDir, 'fesm2022');
  const [entry] = (await readdir(fesmDir)).filter((file) => file.endsWith('.mjs'));
  assert.ok(entry, `No FESM bundle found in ${fesmDir}. Run pnpm build:lib first.`);
  return import(pathToFileURL(path.join(fesmDir, entry)).href);
}

async function render(rootComponent, providers = []) {
  const document = '<!doctype html><html><head></head><body><test-root></test-root></body></html>';
  const html = await renderApplication(
    (context) =>
      bootstrapApplication(
        rootComponent,
        { providers: [provideZonelessChangeDetection(), provideServerRendering(), ...providers] },
        context,
      ),
    { document, url: '/' },
  );
  const body = html.slice(html.indexOf('<body'));
  return { html, body };
}

function svgFor(body, selector) {
  const match = body.match(new RegExp(`<${selector}[^>]*>(<svg[^>]*>)`));
  assert.ok(match, `Rendered ${selector} with an inner svg`);
  return match[1];
}

for (const variant of variants) {
  const pkg = await loadPackage(variant.dist);
  const Home = pkg[`${variant.classPrefix}HomeIconComponent`];
  const Search = pkg[`${variant.classPrefix}SearchIconComponent`];
  const styleId = `${variant.prefix}-icon-styles`;

  test(`${variant.id}: template ariaLabel and default aria-hidden`, async () => {
    const Root = Component({
      selector: 'test-root',
      imports: [Home, Search],
      template: `<${variant.prefix}-home-icon /><${variant.prefix}-search-icon ariaLabel="Search" />`,
    })(class {});
    const { body } = await render(Root);

    const homeSvg = svgFor(body, `${variant.prefix}-home-icon`);
    assert.match(homeSvg, /aria-hidden="true"/);
    assert.doesNotMatch(homeSvg, /role=|aria-label=/);
    assert.match(homeSvg, /viewBox="0 -960 960 960"/);
    assert.match(homeSvg, /focusable="false"/);
    assert.match(homeSvg, new RegExp(`class="${variant.prefix}-icon-svg"`));

    const searchSvg = svgFor(body, `${variant.prefix}-search-icon`);
    assert.match(searchSvg, /aria-label="Search"/);
    assert.match(searchSvg, /role="img"/);
    assert.doesNotMatch(searchSvg, /aria-hidden=/);
  });

  test(`${variant.id}: ComponentRef.setInput('ariaLabel')`, async () => {
    const Root = Component({ selector: 'test-root', template: '' })(
      class {
        constructor() {
          const ref = inject(ViewContainerRef).createComponent(Home);
          ref.setInput('ariaLabel', 'Home');
        }
      },
    );
    const { body } = await render(Root);
    const svg = svgFor(body, `${variant.prefix}-home-icon`);
    assert.match(svg, /aria-label="Home"/);
    assert.match(svg, /role="img"/);
  });

  test(`${variant.id}: NgComponentOutlet inputs`, async () => {
    const Root = Component({
      selector: 'test-root',
      imports: [NgComponentOutlet],
      template: `<ng-container *ngComponentOutlet="icon; inputs: { ariaLabel: 'Outlet' }" />`,
    })(
      class {
        icon = Home;
      },
    );
    const { body } = await render(Root);
    const svg = svgFor(body, `${variant.prefix}-home-icon`);
    assert.match(svg, /aria-label="Outlet"/);
    assert.match(svg, /role="img"/);
  });

  test(`${variant.id}: one shared style element with CSP nonce`, async () => {
    const Root = Component({
      selector: 'test-root',
      imports: [Home, Search],
      template: `<${variant.prefix}-home-icon /><${variant.prefix}-search-icon /><${variant.prefix}-home-icon />`,
    })(class {});
    const { html } = await render(Root, [{ provide: CSP_NONCE, useValue: 'test-nonce' }]);

    const styles = html.match(new RegExp(`<style[^>]*id="${styleId}"[^>]*>[^<]*</style>`, 'g')) ?? [];
    assert.equal(styles.length, 1);
    assert.match(styles[0], /nonce="test-nonce"/);
    assert.ok(styles[0].includes(pkg[`${variant.prefix.toUpperCase()}_ICON_STYLES`]));
    assert.doesNotMatch(html, /_ngcontent-|_nghost-/, 'icons no longer carry emulated component styles');
  });
}
