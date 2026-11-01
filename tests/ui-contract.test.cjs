const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'src/ui-v09.css'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

test('v0.9 owns a single active design theme and stable app version', () => {
  assert.ok(html.includes('href="/src/v7.css"'));
  assert.ok(html.includes('href="/src/ui-v09.css"'));
  assert.ok(!html.includes('href="/src/v7-glass.css"'));
  assert.ok(!html.includes('href="/src/ui-system.css"'));
  assert.ok(html.indexOf('/src/v7.css')<html.indexOf('/src/ui-v09.css'));
  assert.equal(pkg.version, '0.9.0-dev');
  assert.match(html, /application-version" content="0\.9\.0-dev"/);
});

test('Semantic theme tokens preserve legibility without active photo covers', () => {
  for(const key of ['--ui-background','--ui-foreground','--ui-card','--ui-primary','--ui-primary-foreground','--ui-muted','--ui-border','--ui-ring','--ui-radius']) {
    assert.ok(css.includes(key+':'),key);
  }
  assert.match(css, /background-image:none\s*!important/);
  assert.match(css,/\.app-shell \.ui-exercise-mark/);
});

test('v0.9 focused workout controls remain real DOM buttons', () => {
  for(const id of ['v7WeightMinus','v7WeightValueBtn','v7WeightPlus','v7RepsMinus','v7RepsValueBtn','v7RepsPlus','v7LogSetBtn']) {
    assert.match(html,new RegExp('id="'+id+'"'));
  }
  assert.match(html,/class="ui9-metrics-grid"/);
});

test('Program preserves existing state IDs and accessible completion progress', () => {
  for(const id of ['v7WeekDays','v7WorkoutTemplates','v7TemplateSelect','v7WeekGrid','v7ProgramProgress','v7ProgramPercent']) {
    assert.match(html,new RegExp('id="'+id+'"'));
  }
  assert.match(html,/id="v9ProgramProgressTrack"[^>]*role="progressbar"/);
  assert.match(html,/aria-valuemax="36"/);
  assert.match(html,/id="v7ProgramTitle"/);
  assert.match(html,/id="v9ThisWeekTitle"/);
});

test('Roadmap and coaching details are native keyboard-accessible disclosures', () => {
  assert.match(html,/<details class="v7-card ui9-program-details">\s*<summary>12 haftalık yol haritası/);
  assert.match(html,/<details class="v7-card ui9-program-details">\s*<summary>Program mantığı/);
  assert.match(css,/\.app-shell \.ui9-program-details > summary:focus-visible/);
});

test('iOS safe area and reduced motion remain supported', () => {
  assert.match(css,/env\(safe-area-inset-bottom/);
  assert.match(css,/prefers-reduced-motion/);
  assert.match(css,/\.app-shell \.v7-navigation\.ui-tabbar/);
  assert.match(css,/\.app-shell \.ui9-program-day \{/);
});
