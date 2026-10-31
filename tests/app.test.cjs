const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = html.lastIndexOf('<script>') + '<script>'.length;
const end = html.indexOf('</script>', start);
assert.ok(start > 8 && end > start, 'application script exists');
const script = html.slice(start, end);
assert.doesNotThrow(() => new Function(script), 'application syntax is valid');

class FakeElement {
  constructor() {
    this.children = [];
    this.listeners = {};
    this.value = '';
    this.textContent = '';
    this.style = {};
    this.attributes = {};
    const flags = new Set();
    this.classList = {
      add: v => flags.add(v),
      remove: v => flags.delete(v),
      toggle: (v, force) => force ? flags.add(v) : flags.delete(v),
      contains: v => flags.has(v)
    };
  }
  set innerHTML(value) { this._html = value; }
  get innerHTML() { return this._html || ''; }
  appendChild(child) { this.children.push(child); return child; }
  querySelector() { return new FakeElement(); }
  querySelectorAll() { return []; }
  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k]; }
  addEventListener(name, fn) { this.listeners[name] = fn; }
  focus() {}
}

function createApp(saved) {
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new FakeElement());
      return elements.get(id);
    },
    createElement() { return new FakeElement(); },
    querySelectorAll() { return []; },
    addEventListener() {}
  };
  const storage = new Map(saved ? [['arm_5x5_app_state_v1', JSON.stringify(saved)]] : []);
  const localStorage = {
    getItem(k) { return storage.get(k) || null; },
    setItem(k, v) { storage.set(k, v); }
  };
  const app = new Function('window', 'document', 'localStorage', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout', script + `
    return {
      getDefaultState, loadState, getScheduledWorkoutType, getActiveWorkoutExercises,
      getSessionSnapshot, getSetStorageKey, predictExerciseProgress, recordExerciseSet,
      openFinishPreview, completeWorkoutSession, renderExercises,
      getState: () => state,
      setState: next => { state = next; }
    };
  `)(
    { addEventListener() {}, confirm() { return true; } },
    document,
    localStorage,
    () => 1, () => {}, () => 1, () => {}
  );
  return { app, document, storage };
}

function recordAll(app, partialExercise = null) {
  for (const item of app.getActiveWorkoutExercises()) {
    for (let i = 0; i < item.sets; i++) {
      const reps = item.exId === partialExercise && i === 0 ? item.reps - 1 : item.reps;
      assert.equal(app.recordExerciseSet(item.setKey, i, reps, item.stats.weight), true);
    }
  }
}

test('new installation starts without demo achievements', () => {
  const { app } = createApp();
  const state = app.getDefaultState();
  assert.deepEqual(state.quickTracker, [false, false, false, false, false]);
  assert.deepEqual(state.armMeasurements, []);
  assert.deepEqual(state.workoutLogs, []);
  assert.deepEqual(state.activeWeights, {});
  assert.ok(Object.values(state.exStats).every(v => v.history.length === 0));
});

test('A/B alternation is correct and week seven reduces sets', () => {
  const { app } = createApp();
  assert.deepEqual([0,1,2].map(d => app.getScheduledWorkoutType(1,d)), ['A','B','A']);
  assert.deepEqual([0,1,2].map(d => app.getScheduledWorkoutType(2,d)), ['B','A','B']);
  app.getState().currentWeek = 7;
  const workouts = app.getActiveWorkoutExercises();
  assert.equal(workouts[0].sets, 3);
  assert.equal(workouts[2].sets, 2);
});

test('per-week and per-day set data is isolated', () => {
  const { app } = createApp();
  const state = app.getState();
  const oldSet = app.getActiveWorkoutExercises()[0];
  assert.equal(app.recordExerciseSet(oldSet.setKey, 0, 5, 27.5), true);
  state.currentWeek = 3;
  assert.equal(app.getActiveWorkoutExercises()[0].setValues[0], null);
  state.currentWeek = 1;
  state.currentDayIdx = 2;
  assert.equal(app.getActiveWorkoutExercises()[0].setValues[0], null);
  state.currentDayIdx = 0;
  assert.equal(app.getActiveWorkoutExercises()[0].setValues[0], 5);
});

test('actual reps AND actual per-set weight determine volume', () => {
  const { app } = createApp();
  const item = app.getActiveWorkoutExercises()[0];
  assert.equal(app.recordExerciseSet(item.setKey, 0, 3, 17.5), true);
  const snapshot = app.getSessionSnapshot();
  assert.equal(snapshot.recordedSets, 1);
  assert.equal(snapshot.volume, Math.round(3 * 17.5));
  assert.equal(snapshot.ready, false);
  assert.equal(snapshot.missing.length, snapshot.totalSets - 1);
  assert.equal(app.recordExerciseSet(item.setKey, 0, 30.5, 17.5), false);
  assert.equal(app.recordExerciseSet(item.setKey, 0, 3, 0), false);
  assert.equal(app.recordExerciseSet(item.setKey, 0, 31, 17.5), false);
});

test('deleting a set also deletes its recorded weight', () => {
  const { app } = createApp();
  const item = app.getActiveWorkoutExercises()[0];
  app.recordExerciseSet(item.setKey, 0, 3, 17.5);
  assert.equal(app.recordExerciseSet(item.setKey, 0, null, null), true);
  assert.equal(app.getSessionSnapshot().recordedSets, 0);
  assert.equal(app.getState().activeWeights[item.setKey][0], null);
});

test('incomplete or previously saved sessions cannot progress', () => {
  const { app } = createApp();
  const state = app.getState();
  const weight = state.exStats.barbell_curl.weight;
  assert.equal(app.completeWorkoutSession(), false);
  assert.equal(state.exStats.barbell_curl.weight, weight);
  app.openFinishPreview();
  assert.equal(state.workoutLogs.length, 0);
  state.completedSlots.w1_d0 = true;
  assert.equal(app.completeWorkoutSession(), false);
  assert.equal(state.workoutLogs.length, 0);
});

test('pre-save modal disables confirmation when sets are missing', () => {
  const { app, document } = createApp();
  app.openFinishPreview();
  assert.equal(document.getElementById('confirmFinishBtn').disabled, true);
  assert.match(document.getElementById('finishPreviewBody').innerHTML, /eksik/);
  recordAll(app);
  app.openFinishPreview();
  assert.equal(document.getElementById('confirmFinishBtn').disabled, false);
});

test('successful session records real sets and increases next working weight once', () => {
  const { app } = createApp();
  const state = app.getState();
  const before = state.exStats.barbell_curl.weight;
  recordAll(app);
  const actualVolume = app.getSessionSnapshot().volume;
  assert.equal(app.completeWorkoutSession(), true);
  assert.equal(state.workoutLogs.length, 1);
  assert.equal(state.workoutLogs[0].volume, actualVolume);
  assert.equal(state.workoutLogs[0].exercises.length, 3);
  assert.equal(state.workoutLogs[0].exercises[0].sets[0].weight, before);
  assert.equal(state.exStats.barbell_curl.history[0].weight, before);
  assert.ok(state.exStats.barbell_curl.weight > before);
  assert.equal(state.currentDayIdx, 1);
  state.currentDayIdx = 0;
  assert.equal(app.completeWorkoutSession(), false);
  assert.equal(state.workoutLogs.length, 1);
});

test('three failed workouts for the same exercise trigger a deload', () => {
  const { app } = createApp();
  const state = app.getState();
  for (const week of [1, 3, 5]) {
    state.currentWeek = week;
    state.currentDayIdx = 0;
    recordAll(app, 'barbell_curl');
    assert.equal(app.completeWorkoutSession(), true);
  }
  assert.equal(state.exStats.barbell_curl.failStreak, 0);
  assert.ok(state.exStats.barbell_curl.weight < 27.5);
});

test('legacy exercise-only sets migrate into the scoped active session', () => {
  const { app } = createApp({ activeSets: { barbell_curl: [5, null, null, null, null] } });
  app.loadState();
  const item = app.getActiveWorkoutExercises()[0];
  assert.equal(item.setValues[0], 5);
  assert.equal(app.getState().activeSets.barbell_curl, undefined);
});
