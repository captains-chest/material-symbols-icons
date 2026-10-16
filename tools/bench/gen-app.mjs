#!/usr/bin/env node
// Writes the benchmark consumer app (30 eager icons + 2 lazy-route-only icons) into an Angular SSR app.
import fs from 'node:fs';
import path from 'node:path';
const appDir = path.resolve(process.argv[2] ?? '/workspace/icons/ssr-test');
const outline = ['add','arrow-back','arrow-forward','calendar-today','call','check','close','download','edit','error','expand-less','expand-more','help','home','info','lock','mail','menu','more-vert','notifications','person','refresh','remove','search','share','shopping-cart','upload','visibility','warning'].slice(0, 28);
const filled = ['favorite', 'star'];
const pascal = (n) => n.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');
const o = outline.map((n) => ({ sel: `msr-${n}-icon`, cls: `Msr${pascal(n)}IconComponent` }));
const f = filled.map((n) => ({ sel: `msrf-${n}-icon`, cls: `Msrf${pascal(n)}IconComponent` }));
const src = path.join(appDir, 'src/app');
fs.writeFileSync(path.join(src, 'app.ts'), `import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ${o.map((x) => x.cls).join(', ')} } from '@captains-chest/material-symbols-rounded-icons';
import { ${f.map((x) => x.cls).join(', ')} } from '@captains-chest/material-symbols-rounded-icons-filled';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, ${[...o, ...f].map((x) => x.cls).join(', ')}],
  template: \`<p id="icons">${[...o, ...f].map((x, i) => `<${x.sel}${i === 1 ? ' ariaLabel="Back"' : ''} />`).join('')}</p><a routerLink="/lazy">lazy</a><router-outlet />\`,
})
export class App {}
`);
fs.writeFileSync(path.join(src, 'lazy.ts'), `import { Component } from '@angular/core';
import { MsrSettingsIconComponent, MsrDeleteIconComponent } from '@captains-chest/material-symbols-rounded-icons';
@Component({ imports: [MsrSettingsIconComponent, MsrDeleteIconComponent], template: \`<div id="lazy"><msr-settings-icon /><msr-delete-icon /></div>\` })
export default class Lazy {}
`);
fs.writeFileSync(path.join(src, 'app.routes.ts'), `import { Routes } from '@angular/router';
import { Component } from '@angular/core';
@Component({ template: '' }) class Empty {}
export const routes: Routes = [{ path: '', component: Empty }, { path: 'lazy', loadComponent: () => import('./lazy') }];
`);
fs.writeFileSync(path.join(src, 'app.routes.server.ts'), `import { RenderMode, ServerRoute } from '@angular/ssr';
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'lazy', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server },
];
`);
for (const f of ['app.html', 'app.spec.ts']) fs.rmSync(path.join(src, f), { force: true });
console.log('bench app written to', appDir);
