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
      getSessionReadiness, setSessionReadiness, calculateWeekMuscleVolume, renderMuscleVolume, TEMPLATES,
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

test('week-seven recovery preserves the planned weight even after all sets are completed', () => {
  const { app } = createApp();
  const state = app.getState();
  state.currentWeek = 7;
  const before = state.exStats.barbell_curl.weight;
  recordAll(app);
  assert.equal(app.predictExerciseProgress(app.getActiveWorkoutExercises()[0]).kind, 'hold');
  assert.equal(app.completeWorkoutSession(), true);
  assert.equal(state.exStats.barbell_curl.weight, before);
  assert.equal(state.workoutLogs[0].exercises[0].result, 'hold');
});

test('Growth is opt-in and offers a lower/upper repetition range', () => {
  const { app } = createApp();
  assert.equal(app.getState().templateKey, 'standard');
  app.getState().templateKey = 'growth';
  const list = app.getActiveWorkoutExercises();
  assert.equal(list.length, 3);
  assert.deepEqual(list.map(item => [item.sets, item.minReps, item.reps]), [[3, 6, 10], [3, 6, 10], [3, 10, 15]]);
  app.getState().currentDayIdx = 1;
  assert.deepEqual(app.getActiveWorkoutExercises().map(item => [item.minReps, item.reps]), [[10, 15], [8, 12], [10, 15]]);
});

test('Growth requires explicit readiness before increasing working weight', () => {
  const { app } = createApp();
  app.getState().templateKey = 'growth';
  recordAll(app);
  const item = app.getActiveWorkoutExercises()[0];
  assert.equal(app.getSessionReadiness().energy, 'unreported');
  assert.equal(app.predictExerciseProgress(item).kind, 'hold');
  assert.equal(app.predictExerciseProgress(item).reason, 'readiness');
  assert.equal(app.setSessionReadiness('good', false), true);
  const recommended = app.predictExerciseProgress(item);
  assert.equal(recommended.kind, 'success');
  assert.ok(recommended.nextWeight > item.stats.weight);
});

test('Growth holds weight while reps improve within the target interval', () => {
  const { app } = createApp();
  app.getState().templateKey = 'growth';
  app.setSessionReadiness('normal', false);
  const item = app.getActiveWorkoutExercises()[0];
  for (let i = 0; i < item.sets; i++) {
    app.recordExerciseSet(item.setKey, i, item.minReps + 1, item.stats.weight);
  }
  item.stats.failStreak = 1;
  const decision = app.predictExerciseProgress(item);
  assert.equal(decision.kind, 'build');
  assert.equal(decision.nextWeight, item.stats.weight);
});

test('Growth does not recommend raising weight on a lighter recorded set', () => {
  const { app } = createApp();
  app.getState().templateKey = 'growth';
  app.setSessionReadiness('good', false);
  const item = app.getActiveWorkoutExercises()[0];
  for (let i = 0; i < item.sets; i++) {
    app.recordExerciseSet(item.setKey, i, item.reps, i === 0 ? item.stats.weight - 1 : item.stats.weight);
  }
  assert.equal(app.predictExerciseProgress(item).kind, 'build');
  assert.equal(app.predictExerciseProgress(item).reason, 'weight');
});

test('Low energy or joint discomfort blocks progression without pretending recovery was measured', () => {
  const { app } = createApp();
  app.getState().templateKey = 'growth';
  recordAll(app);
  const item = app.getActiveWorkoutExercises()[0];
  app.setSessionReadiness('low', false);
  assert.equal(app.predictExerciseProgress(item).reason, 'fatigue');
  app.setSessionReadiness('good', true);
  assert.equal(app.predictExerciseProgress(item).reason, 'joint');
  assert.equal(app.getSessionReadiness().jointDiscomfort, true);
  app.setSessionReadiness('normal', false);
  assert.equal(app.predictExerciseProgress(item).kind, 'success');
});

test('Growth tracks failed attempts below the lower rep bound only', () => {
  const { app } = createApp();
  const state = app.getState();
  state.templateKey = 'growth';
  const growthStartWeight = state.growthExStats.barbell_curl.weight;
  const strengthStartWeight = state.exStats.barbell_curl.weight;
  for (const week of [1, 3, 5]) {
    state.currentWeek = week;
    state.currentDayIdx = 0;
    app.setSessionReadiness('normal', false);
    for (const item of app.getActiveWorkoutExercises()) {
      for (let i = 0; i < item.sets; i++) {
        const count = item.exId === 'barbell_curl' && i === 0 ? item.minReps - 1 : item.reps;
        app.recordExerciseSet(item.setKey, i, count, item.stats.weight);
      }
    }
    assert.equal(app.completeWorkoutSession(), true);
  }
  assert.equal(state.growthExStats.barbell_curl.failStreak, 0);
  assert.ok(state.growthExStats.barbell_curl.weight < growthStartWeight);
  assert.equal(state.exStats.barbell_curl.weight, strengthStartWeight);
});

test('Muscle volume counts only stored direct sets above their program minimum', () => {
  const { app } = createApp();
  const state = app.getState();
  state.templateKey = 'growth';
  app.setSessionReadiness('normal', false);
  for (const item of app.getActiveWorkoutExercises()) {
    for (let i = 0; i < item.sets; i++) {
      const reps = item.exId === 'barbell_curl' && i === 0 ? item.minReps - 1 : item.minReps;
      app.recordExerciseSet(item.setKey, i, reps, item.stats.weight);
    }
  }
  assert.equal(app.completeWorkoutSession(), true);
  const volume = app.calculateWeekMuscleVolume(1);
  assert.equal(volume.sessions, 1);
  assert.equal(volume.biceps.sets, 5); // 2 curl + 3 hammer
  assert.equal(volume.triceps.sets, 3);
  assert.equal(app.calculateWeekMuscleVolume(2).biceps.sets, 0);
});

test('Legacy workouts without per-set details are not counted as invented volume', () => {
  const { app } = createApp();
  const state = app.getState();
  state.workoutLogs.push({ id: 'w2_d1', title: 'Eski kayıt', volume: 900, details: [] });
  const volume = app.calculateWeekMuscleVolume(2);
  assert.equal(volume.sessions, 1);
  assert.equal(volume.legacySessions, 1);
  assert.equal(volume.biceps.sets, 0);
  assert.equal(volume.triceps.sets, 0);
});

test('Strength and Growth working weights are independent', () => {
  const { app } = createApp();
  const state = app.getState();
  const strengthWeight = state.exStats.barbell_curl.weight;
  state.templateKey = 'growth';
  const growthWeight = state.growthExStats.barbell_curl.weight;
  assert.ok(growthWeight < strengthWeight);
  app.getActiveWorkoutExercises()[0].stats.weight = growthWeight + 1;
  state.templateKey = 'standard';
  assert.equal(app.getActiveWorkoutExercises()[0].stats.weight, strengthWeight);
  state.templateKey = 'growth';
  assert.equal(app.getActiveWorkoutExercises()[0].stats.weight, growthWeight + 1);
});

test('Readiness stays within the selected week and day', () => {
  const { app } = createApp();
  const state = app.getState();
  state.templateKey = 'growth';
  app.setSessionReadiness('good', true);
  state.currentDayIdx = 1;
  assert.deepEqual(app.getSessionReadiness(), {energy: 'unreported', jointDiscomfort: false});
  state.currentDayIdx = 0;
  assert.deepEqual(app.getSessionReadiness(), {energy: 'good', jointDiscomfort: true});
});
