const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'src/ui-system.css'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

test('UI tokens are explicit, readable, and reusable', () => {
  for (const variable of ['--ui-background','--ui-foreground','--ui-card','--ui-primary','--ui-primary-foreground','--ui-muted','--ui-border','--ui-ring','--ui-radius']) {
    assert.ok(css.includes(variable+':'), 'Missing design token '+variable);
  }
});

test('Minimal UI stylesheet is last, after prior visual themes', () => {
  const old = html.indexOf('href="/src/v7-glass.css"');
  const next = html.indexOf('href="/src/ui-system.css"');
  assert.ok(old > 0 && next > old);
});

test('Oversized generated artwork is removed from primary banners', () => {
  for(const cls of ['arm-cover-home','arm-cover-focus','arm-cover-program','arm-cover-progress','arm-cover-settings']) {
    assert.ok(css.includes('.app-shell .'+cls), 'No reset for '+cls);
  }
  assert.match(css, /background-image:none\s*!important/);
  assert.match(css, /\.app-shell \.ui-next-session\s*\{[^}]*min-height:0/);
});

test('Bottom nav is compact and respects iOS safe area', () => {
  assert.match(css, /\.app-shell \.v7-navigation\.ui-tabbar/);
  assert.match(css, /env\(safe-area-inset-bottom/);
  assert.match(css, /\.app-shell \.v7-nav-item\s*\{[^}]*min-height:51px/);
});

test('Exercise rows share a consistent line icon, independent of remote assets', () => {
  assert.match(html, /ui-exercise-mark/);
  assert.match(css, /\.app-shell \.ui-exercise-mark\s*\{/);
  assert.match(css, /background-image:none\s*!important/);
});

test('Saved data behavior and new UI version remain isolated', () => {
  assert.equal(pkg.version, '0.8.0');
  assert.match(html, /application-version" content="0\.8\.0"/);
  assert.match(html, /function getSessionSnapshot\(/);
  assert.match(html, /function v7LogCurrentSet\(/);
  assert.match(html, /function v7RenderToday\(/);
});
