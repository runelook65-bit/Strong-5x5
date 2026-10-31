const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scriptStart = html.lastIndexOf('<script>') + '<script>'.length;
const scriptEnd = html.indexOf('</script>', scriptStart);
const script = html.slice(scriptStart, scriptEnd);
assert.ok(scriptStart > 7 && scriptEnd > scriptStart, 'main script present');

function createApp() {
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) {
        elements.set(id, {
          classList: { add() {}, remove() {}, toggle() {} },
          textContent: ''
        });
      }
      return elements.get(id);
    }
  };
  const storage = new Map();
  const localStorage = {
    getItem(k) { return storage.get(k) || null; },
    setItem(k, v) { storage.set(k, v); }
  };
  const window = { addEventListener() {} };
  const boot = new Function('window', 'document', 'localStorage', script + `
    return {
      getDefaultState,
      getScheduledWorkoutType,
      getSetStorageKey,
      getActiveWorkoutExercises,
      completeWorkoutSession,
      getState: () => state,
      setState: next => { state = next; }
    };
  `);
  return boot(window, document, localStorage);
}

test('a new installation has no pretend workout or circumference measurements', () => {
  const app = createApp();
  const state = app.getDefaultState();
  assert.deepEqual(state.quickTracker, [false, false, false, false, false]);
  assert.equal(state.armMeasurements.length, 0);
  assert.equal(state.workoutLogs.length, 0);
  assert.ok(Object.values(state.exStats).every(ex => ex.history.length === 0));
});

test('the 12-week schedule alternates A/B/A and B/A/B', () => {
  const app = createApp();
  assert.deepEqual([0, 1, 2].map(d => app.getScheduledWorkoutType(1, d)), ['A', 'B', 'A']);
  assert.deepEqual([0, 1, 2].map(d => app.getScheduledWorkoutType(2, d)), ['B', 'A', 'B']);
});

test('sets recorded for one week do not leak into a later week', () => {
  const app = createApp();
  const state = app.getState();
  const first = app.getActiveWorkoutExercises()[0];
  state.activeSets[first.setKey][0] = 5;
  state.currentWeek = 3;
  const later = app.getActiveWorkoutExercises()[0];
  assert.notEqual(first.setKey, later.setKey);
  assert.equal(later.setValues[0], null);
  state.currentWeek = 1;
  assert.equal(app.getActiveWorkoutExercises()[0].setValues[0], 5);
});

test('week 7 cuts working sets without deleting another week\'s data', () => {
  const app = createApp();
  const state = app.getState();
  state.currentWeek = 7;
  const workouts = app.getActiveWorkoutExercises();
  assert.equal(workouts[0].sets, 3);
  assert.equal(workouts[2].sets, 2);
});

test('empty sessions cannot record volume or increase working weight', () => {
  const app = createApp();
  const state = app.getState();
  const starting = state.exStats.barbell_curl.weight;
  app.completeWorkoutSession();
  assert.equal(state.exStats.barbell_curl.weight, starting);
  assert.equal(state.workoutLogs.length, 0);
  assert.equal(Object.keys(state.completedSlots).length, 0);
});

test('a previously saved session cannot be recorded twice', () => {
  const app = createApp();
  const state = app.getState();
  state.completedSlots.w1_d0 = true;
  const oldWeight = state.exStats.barbell_curl.weight;
  app.completeWorkoutSession();
  assert.equal(state.exStats.barbell_curl.weight, oldWeight);
  assert.equal(state.workoutLogs.length, 0);
});
