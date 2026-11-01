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
  set innerHTML(value) { this._html = value; if (value === '') this.children = []; }
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
      getSessionSnapshot, getSetStorageKey, predictExerciseProgress, recordExerciseSet, getPreviousSetPerformance,
      getSessionReadiness, setSessionReadiness, calculateWeekMuscleVolume, renderMuscleVolume, TEMPLATES,
      openFinishPreview, completeWorkoutSession, renderExercises, renderProgressTab,
      makeBackupJSON, parseBackupJSON, restoreBackupJSON, undoLastWorkout,
      escapeHTML, renderMuscleVolume, renderProgramTab, parseWorkoutWeight,
      v7RenderToday, v7EnterFocus, v7Navigate, v7RenderFocus, v7SelectExercise, v7LogCurrentSet,
      v7EditValue, v7ChangeWeek, v7ChangeDay, v7RenderProgram, v7RenderProgress,
      v7RenderSettings, v7BuildStrengthChart, v7BuildVolumeChart, v7OpenValueModal,
      v7SaveValueModal, v7CloseValueModal, v7RenderSettings, v7OpenTool, v7SelectSet,
      getState: () => state,
      setState: next => { state = next; }
    };
  `)(
    { addEventListener() {}, confirm() { return true; } },
    document,
    localStorage,
    () => 1, () => {}, () => 1, () => {}
  );
  return { app, document, storage, localStorage };
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

test('Progress chart does not invent a strength history before first session', () => {
  const { app, document } = createApp();
  app.renderProgressTab();
  assert.equal(document.getElementById('statEst1RM').textContent, '—');
  assert.match(document.getElementById('progressionSvgChart').innerHTML, /Henüz gerçek antrenman kaydı yok/);
});

test('Progress chart and estimated 1RM derive from recorded sets', () => {
  const { app, document } = createApp();
  const state = app.getState();
  recordAll(app);
  assert.equal(app.completeWorkoutSession(), true);
  app.renderProgressTab();
  const measured = document.getElementById('statEst1RM').textContent;
  assert.notEqual(measured, '—');
  assert.match(measured, /kg$/);
  assert.equal(state.exStats.barbell_curl.history.length, 1);
  assert.match(document.getElementById('progressionSvgChart').innerHTML, /circle/);
});

test('JSON backup roundtrip preserves recorded workouts and current pointer', () => {
  const { app } = createApp();
  recordAll(app);
  assert.equal(app.completeWorkoutSession(), true);
  const blob = app.makeBackupJSON();
  assert.equal(JSON.parse(blob).format, 'arm-5x5-backup');
  const validated = app.parseBackupJSON(blob);
  assert.equal(validated.workoutLogs.length, 1);
  assert.equal(validated.currentDayIdx, 1);
  app.getState().currentWeek = 10;
  assert.equal(app.restoreBackupJSON(blob), true);
  assert.equal(app.getState().currentWeek, 1);
  assert.equal(app.getState().workoutLogs.length, 1);
});

test('corrupt and prototype-polluted JSON cannot replace current data', () => {
  const { app, storage } = createApp();
  const original = app.getState();
  const key = 'arm_5x5_app_state_v1';
  const oldStorage = storage.get(key);
  for (const bad of [
    '{not json', '{}', '{"format":"other","state":{}}',
    '{"format":"arm-5x5-backup","schemaVersion":100,"state":{}}',
    '{"__proto__":{"polluted":true},"currentWeek":1}',
    'x'.repeat(2*1024*1024+1)
  ]) {
    assert.throws(() => app.restoreBackupJSON(bad));
    assert.equal(app.getState(), original);
    assert.equal(storage.get(key), oldStorage);
  }
});

test('legacy v0.3 state is accepted and missing growth profile is restored', () => {
  const { app } = createApp();
  const old = app.getDefaultState();
  delete old.growthExStats;
  delete old.readinessBySlot;
  delete old.activeWeights;
  assert.equal(app.restoreBackupJSON(JSON.stringify(old)), true);
  assert.ok(app.getState().growthExStats.barbell_curl);
  assert.deepEqual(app.getState().workoutLogs, []);
});

test('valid backup does not overwrite memory when persistent storage fails', () => {
  const { app, localStorage } = createApp();
  const backup = app.makeBackupJSON();
  const original = app.getState();
  original.currentWeek = 8;
  localStorage.setItem = () => { throw new Error('Quota exceeded'); };
  assert.throws(() => app.restoreBackupJSON(backup));
  assert.equal(app.getState(), original);
  assert.equal(app.getState().currentWeek, 8);
});

test('undo last saved workout restores weights, set entries and completion pointer', () => {
  const { app } = createApp();
  const state = app.getState();
  const old = state.exStats.barbell_curl.weight;
  recordAll(app);
  const beforeVolume = app.getSessionSnapshot().volume;
  assert.equal(app.completeWorkoutSession(), true);
  assert.equal(state.workoutLogs[0].volume, beforeVolume);
  assert.equal(state.workoutLogs.length, 1);
  assert.equal(app.undoLastWorkout(), true);
  assert.equal(state.workoutLogs.length, 0);
  assert.equal(state.currentDayIdx, 0);
  assert.equal(state.exStats.barbell_curl.weight, old);
  assert.equal(state.exStats.barbell_curl.history.length, 0);
  assert.equal(state.completedSlots.w1_d0, undefined);
  assert.equal(app.getSessionSnapshot().ready, true);
  assert.equal(app.completeWorkoutSession(), true);
  assert.equal(app.undoLastWorkout(), true);
});

test('legacy workout without a reversible snapshot cannot be undone', () => {
  const { app } = createApp();
  app.getState().workoutLogs.push({id:'w1_d0',title:'Legacy',volume:50,details:[]});
  app.getState().completedSlots.w1_d0 = true;
  assert.equal(app.undoLastWorkout(), false);
  assert.equal(app.getState().workoutLogs.length, 1);
});

test('history and measurement text is HTML escaped', () => {
  const { app } = createApp();
  assert.equal(app.escapeHTML('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});

test('muscle chart renders actual records, not synthetic volumes', () => {
  const { app, document } = createApp();
  app.renderMuscleVolume();
  assert.equal(document.getElementById('weeklyVolumeGraph').children.length, 12);
  assert.equal(document.getElementById('bicepsMuscleShare').textContent, '—');
  assert.equal(document.getElementById('tricepsMuscleShare').textContent, '—');
});

test('backup refuses nested invalid exercise logs and duplicated session IDs', () => {
  const { app } = createApp();
  const base = app.getDefaultState();
  base.workoutLogs.push({ id: 'w1_d0', title:'Session A', volume:20, details:[], exercises:[null] });
  assert.throws(() => app.restoreBackupJSON(JSON.stringify(base)));
  base.workoutLogs[0].exercises = [{exId:'barbell_curl',sets:[{reps:300,weight:5}]}];
  assert.throws(() => app.restoreBackupJSON(JSON.stringify(base)));
  base.workoutLogs[0].exercises = [{exId:'barbell_curl',sets:[{reps:5,weight:5}]}];
  base.workoutLogs.push({...base.workoutLogs[0]});
  assert.throws(() => app.restoreBackupJSON(JSON.stringify(base)));
});

test('undo latest Growth session leaves standard barbell loads untouched', () => {
  const { app } = createApp();
  const state = app.getState();
  const standard = state.exStats.barbell_curl.weight;
  state.templateKey = 'growth';
  const growth = state.growthExStats.barbell_curl.weight;
  app.setSessionReadiness('good', false);
  recordAll(app);
  assert.equal(app.completeWorkoutSession(), true);
  assert.ok(state.growthExStats.barbell_curl.weight > growth);
  assert.equal(app.undoLastWorkout(), true);
  assert.equal(state.growthExStats.barbell_curl.weight, growth);
  assert.equal(state.exStats.barbell_curl.weight, standard);
  assert.equal(state.templateKey, 'growth');
});

test('cold measurements determine growth and pump measurements do not distort it', () => {
  const { app, document } = createApp();
  const state = app.getState();
  state.armMeasurements = [
    {date:'Hafta 1',cm:33,note:'Soğuk'},
    {date:'Hafta 1',cm:38,note:'Pump'},
    {date:'Hafta 2',cm:33.5,note:'Soğuk'},
    {date:'Hafta 2',cm:40,note:'Pump'}
  ];
  app.renderProgressTab();
  assert.equal(document.getElementById('armGrowthDeltaBadge').textContent, '+0.5 cm');
});

test('Performance Logger opens current exercise and renders compact five-row set table', () => {
  const { app, document } = createApp();
  app.renderExercises();
  const cards = document.getElementById('exerciseCardsContainer').children;
  assert.equal(cards.length, 3);
  assert.equal(cards[0].open, true);
  assert.equal(cards[1].open, false);
  const panelBody = cards[0].children[1];
  const rows = panelBody.children[2].children;
  assert.equal(rows.length, 5);
  assert.equal(rows[0].children.length, 5);
  assert.equal(rows[0].children[2].value, '27.5');
  assert.equal(rows[0].children[3].value, '5');
  assert.equal(rows[0].children[4].textContent, '+');
});

test('Inline set completion saves real weight/reps and automatically advances next row', () => {
  const { app, document } = createApp();
  app.renderExercises();
  const currentCard = () => document.getElementById('exerciseCardsContainer').children[0];
  const getRow = index => currentCard().children[1].children[2].children[index];
  getRow(0).children[2].value = '25';
  getRow(0).children[3].value = '4';
  getRow(0).children[4].listeners.click();
  const exercise = app.getActiveWorkoutExercises()[0];
  assert.equal(exercise.setValues[0], 4);
  assert.equal(exercise.setWeights[0], 25);
  assert.equal(getRow(0).children[4].textContent, '✓');
  assert.equal(getRow(1).children[4].textContent, '+');
  assert.equal(app.getSessionSnapshot().recordedSets, 1);
});

test('Inline set edits update original record without adding duplicate sets', () => {
  const { app, document } = createApp();
  const item = app.getActiveWorkoutExercises()[0];
  assert.equal(app.recordExerciseSet(item.setKey, 0, 5, 27.5), true);
  app.renderExercises();
  const row = document.getElementById('exerciseCardsContainer').children[0].children[1].children[2].children[0];
  row.children[2].value = '23.5';
  row.children[3].value = '3';
  row.children[4].listeners.click();
  assert.equal(app.getActiveWorkoutExercises()[0].setValues[0], 3);
  assert.equal(app.getActiveWorkoutExercises()[0].setWeights[0], 23.5);
  assert.equal(app.getSessionSnapshot().recordedSets, 1);
});

test('Inline set validation rejects empty, negative and fractional repetitions', () => {
  const { app, document } = createApp();
  app.renderExercises();
  const row = document.getElementById('exerciseCardsContainer').children[0].children[1].children[2].children[0];
  for (const value of ['', '-1', '4.5', '31']) {
    row.children[3].value = value;
    row.children[4].listeners.click();
    assert.equal(app.getSessionSnapshot().recordedSets, 0);
  }
});

test('Previous set column uses only actual saved workout for selected template', () => {
  const { app } = createApp();
  const state = app.getState();
  assert.equal(app.getPreviousSetPerformance('barbell_curl', 0, 'standard'), null);
  recordAll(app);
  assert.equal(app.completeWorkoutSession(), true);
  assert.deepEqual(app.getPreviousSetPerformance('barbell_curl', 0, 'standard'), {reps:5,weight:27.5});
  assert.equal(app.getPreviousSetPerformance('barbell_curl', 0, 'growth'), null);
  assert.equal(app.getPreviousSetPerformance('barbell_curl', 99, 'standard'), null);
});

test('Mobile layout keeps timer inside workout and footer safe-area accessible', () => {
  assert.match(html, /<details id="restTimerBar"/);
  assert.match(html, /class="app-main [^"]*"/);
  assert.match(html, /\.app-shell\s*\{\s*padding-bottom:\s*calc\(114px \+ env\(safe-area-inset-bottom/);
  assert.match(html, /\.app-bottom-nav\s*\{[^}]*env\(safe-area-inset-bottom/);
  assert.match(html, /className = 'workout-set-heading'/);
});

test('Weight entry accepts Turkish decimal comma without accepting malformed input', () => {
  const { app } = createApp();
  assert.equal(app.parseWorkoutWeight('27,5'), 27.5);
  assert.equal(app.parseWorkoutWeight('27.5'), 27.5);
  assert.equal(app.parseWorkoutWeight(' 12,25 '), 12.25);
  assert.ok(Number.isNaN(app.parseWorkoutWeight('27,5abc')));
  assert.ok(Number.isNaN(app.parseWorkoutWeight('')));
});

test('Program hero shows only actual saved-session completion and week sequence', () => {
  const { app, document } = createApp();
  app.renderProgramTab();
  assert.equal(document.getElementById('programHeroCounter').textContent, '0 / 36');
  assert.equal(document.getElementById('programHeroTitle').textContent, 'Hafta 1 · A/B/A');
  app.getState().currentWeek = 2;
  app.renderProgramTab();
  assert.equal(document.getElementById('programHeroTitle').textContent, 'Hafta 2 · B/A/B');
  app.getState().completedSlots.w1_d0 = true;
  app.renderProgramTab();
  assert.equal(document.getElementById('programHeroCounter').textContent, '1 / 36');
});

test('Progress overview starts without fake volume or arm growth', () => {
  const { app, document } = createApp();
  app.renderProgressTab();
  assert.equal(document.getElementById('progressTotalSessions').textContent, '0');
  assert.equal(document.getElementById('progressTotalVolume').textContent, '—');
  assert.equal(document.getElementById('progressColdDelta').textContent, '—');
});

test('Progress overview reports recorded weight volume and consistent cold measurements', () => {
  const { app, document } = createApp();
  recordAll(app);
  const actual = app.getSessionSnapshot().volume;
  assert.equal(app.completeWorkoutSession(), true);
  app.getState().armMeasurements = [
    {date:'Hafta 1',cm:34,note:'Soğuk'},
    {date:'Hafta 1',cm:37,note:'Pump'},
    {date:'Hafta 2',cm:34.5,note:'Soğuk'}
  ];
  app.renderProgressTab();
  assert.equal(document.getElementById('progressTotalSessions').textContent, '1');
  assert.equal(document.getElementById('progressColdDelta').textContent, '+0.5 cm');
  assert.ok(document.getElementById('progressTotalVolume').textContent.includes('kg'));
  assert.ok(actual > 0);
});

test('Inline logger uses nonsticky rest panel and never duplicates set entry forms', () => {
  const { app, document } = createApp();
  app.renderExercises();
  const card = document.getElementById('exerciseCardsContainer').children[0];
  const body = card.children[1];
  const rowContainer = body.children[2];
  assert.equal(rowContainer.children.length, 5);
  assert.match(html, /<details id="restTimerBar"/);
  assert.ok(!/<div id="restTimerBar" class="sticky/.test(html));
  assert.ok(!html.includes('Sıradaki set · 1/5'));
});

test('PWA release 0.9.0-dev exposes five-screen architecture and update UI', () => {
  for (const id of ['v7Today','v7Focus','v7Program','v7Progress','v7Settings','v7ToolDetail']) {
    assert.match(html, new RegExp('id="'+id+'"'));
  }
  assert.match(html, /<meta name="application-version" content="0\.9\.0-dev"/);
  assert.match(html, /id="appUpdateBanner"/);
  assert.match(html, /serviceWorker\.addEventListener\('controllerchange'/);
});

test('Today is a launchpad, not a set table, and starts without invented metrics', () => {
  const { app, document } = createApp();
  app.v7RenderToday();
  assert.equal(document.getElementById('v7HeroTitle').textContent, 'Workout A');
  assert.equal(document.getElementById('v7TodayExercises').children.length, 3);
  assert.equal(document.getElementById('v7StatWeek').textContent, '1 / 12');
  assert.equal(document.getElementById('v7StatSessions').textContent, '0 / 3');
  assert.equal(document.getElementById('v7StatArm').textContent, '—');
  assert.equal(document.getElementById('v7StartLabel').textContent, 'Antrenmanı Başlat');
});

test('Workout focus hides the bottom tabs and shows one actual exercise', () => {
  const { app, document } = createApp();
  assert.equal(app.v7EnterFocus(0), true);
  assert.equal(document.getElementById('v7Focus').classList.contains('hidden'), false);
  assert.equal(document.getElementById('v7Nav').classList.contains('hidden'), true);
  assert.equal(document.getElementById('v7ExerciseName').textContent, 'Barbell Curl');
  assert.equal(document.getElementById('v7WeightText').textContent, '27.5');
  assert.equal(document.getElementById('v7RepsText').textContent, '5');
  assert.equal(document.getElementById('v7SetDots').children.length, 5);
  app.v7Navigate('today');
  assert.equal(document.getElementById('v7Nav').classList.contains('hidden'), false);
});

test('Focus Seti Tamamla saves real set data and home offers to continue', () => {
  const { app, document } = createApp();
  app.v7EnterFocus(0);
  assert.equal(app.v7LogCurrentSet(), true);
  assert.equal(app.getSessionSnapshot().recordedSets, 1);
  assert.equal(app.getActiveWorkoutExercises()[0].setValues[0], 5);
  app.v7RenderToday();
  assert.equal(document.getElementById('v7StartLabel').textContent, 'Antrenmana Devam Et');
});

test('Focus weight/repetition steppers update draft values, not saved data', () => {
  const { app, document } = createApp();
  app.v7EnterFocus(0);
  app.v7EditValue('weight', -0.5);
  app.v7EditValue('reps', -2);
  assert.equal(document.getElementById('v7WeightText').textContent, '27');
  assert.equal(document.getElementById('v7RepsText').textContent, '3');
  assert.equal(app.getSessionSnapshot().recordedSets, 0);
  app.v7LogCurrentSet();
  assert.equal(app.getActiveWorkoutExercises()[0].setValues[0], 3);
  assert.equal(app.getActiveWorkoutExercises()[0].setWeights[0], 27);
});

test('Direct numeric editor accepts Turkish comma and rejects invalid reps', () => {
  const { app, document } = createApp();
  app.v7EnterFocus(0);
  app.v7OpenValueModal('weight');
  document.getElementById('v7ValueInput').value = '19,5';
  app.v7SaveValueModal();
  assert.equal(document.getElementById('v7WeightText').textContent, '19.5');
  app.v7OpenValueModal('reps');
  document.getElementById('v7ValueInput').value = '3.5';
  app.v7SaveValueModal();
  assert.equal(document.getElementById('v7RepsText').textContent, '5');
  document.getElementById('v7ValueInput').value = '8';
  app.v7SaveValueModal();
  assert.equal(document.getElementById('v7RepsText').textContent, '8');
});

test('Week selection and day selection preserve isolated workout slots', () => {
  const { app, document } = createApp();
  const state = app.getState();
  const a = app.getActiveWorkoutExercises()[0];
  app.recordExerciseSet(a.setKey, 0, 5, 27.5);
  assert.equal(app.v7ChangeDay(1), true);
  assert.equal(app.getActiveWorkoutExercises()[0].setValues[0], null);
  assert.equal(app.v7ChangeWeek(7), true);
  app.v7RenderProgram();
  assert.equal(document.getElementById('v7WeekGrid').children.length, 12);
  assert.equal(app.getActiveWorkoutExercises()[0].sets, 3); // first exercise is 5×5 → 3 sets in week 7
  app.v7ChangeWeek(1); app.v7ChangeDay(0);
  assert.equal(app.getActiveWorkoutExercises()[0].setValues[0], 5);
});

test('Program renders the actual A/B week, exercise templates and selections', () => {
  const { app, document } = createApp();
  app.v7RenderProgram();
  assert.equal(document.getElementById('v7WeekDays').children.length, 3);
  assert.equal(document.getElementById('v7WorkoutTemplates').children.length, 2);
  assert.equal(document.getElementById('v7WeekGrid').children.length, 12);
  assert.equal(document.getElementById('v7ProgramPercent').textContent, '0%');
});

test('Progress starts with empty-state charts and no fabricated records', () => {
  const { app, document } = createApp();
  app.v7RenderProgress();
  assert.equal(document.getElementById('v7ProgressSessions').textContent, '0');
  assert.equal(document.getElementById('v7ProgressVolume').textContent, '—');
  assert.equal(document.getElementById('v7ProgressArm').textContent, '—');
  assert.match(document.getElementById('v7StrengthChart').innerHTML, /İlk antrenmanını/);
  assert.match(document.getElementById('v7VolumeChart').innerHTML, /Haftalık hacim/);
});

test('Progress charts and records use completed real workout history', () => {
  const { app, document } = createApp();
  recordAll(app);
  assert.equal(app.completeWorkoutSession(), true);
  app.v7RenderProgress();
  assert.equal(document.getElementById('v7ProgressSessions').textContent, '1');
  assert.match(document.getElementById('v7StrengthChart').innerHTML, /<svg/);
  assert.match(document.getElementById('v7VolumeChart').innerHTML, /<svg/);
  assert.ok(document.getElementById('v7PersonalRecords').children.length > 0);
});

test('Workout recovery preference stays in JSON backup', () => {
  const { app } = createApp();
  const state=app.getState();
  state.v7RestSeconds=120;
  const parsed=app.parseBackupJSON(app.makeBackupJSON());
  assert.equal(parsed.v7RestSeconds, 120);
  assert.equal(app.getDefaultState().v7RestSeconds, 0);
});

test('Settings displays actual persisted sound and rest preferences', () => {
  const { app, document } = createApp();
  app.getState().soundEnabled=false;
  app.getState().v7RestSeconds=150;
  app.v7RenderSettings();
  assert.equal(document.getElementById('v7SoundValue').textContent, 'Kapalı');
  assert.equal(document.getElementById('v7RestPrefValue').textContent, '150 sn ›');
});

test('Focused workout automatically moves to next exercise after all current sets', () => {
  const { app, document } = createApp();
  app.v7EnterFocus(0);
  for (let i=0; i<5; i++) assert.equal(app.v7LogCurrentSet(), true);
  assert.equal(app.getSessionSnapshot().recordedSets, 5);
  assert.equal(document.getElementById('v7ExerciseName').textContent, 'Close-Grip Dumbbell Bench Press');
  assert.equal(document.getElementById('v7FocusSubtitle').textContent, '2 / 3 hareket · Hafta 1');
});

test('Tool pages restore original mounted widgets to avoid losing event bindings', () => {
  const { app, document } = createApp();
  const node = new FakeElement();
  const origin = new FakeElement();
  node.parentElement = origin;
  document.getElementById('armSizeInput').closest = () => node;
  assert.equal(app.v7OpenTool('measure'), true);
  assert.equal(document.getElementById('v7ToolContent').children[0], node);
  app.v7Navigate('settings');
  assert.equal(origin.children[0], node);
});

test('Settings and workout are separate screens, with no nested legacy navigation', () => {
  assert.match(html, /id="v7Today"/);
  assert.match(html, /id="v7Focus"/);
  assert.match(html, /id="v7Settings"/);
  assert.match(html, /<nav id="v7Nav"/);
  assert.match(html, /class="hidden app-header/);
  assert.match(html, /class="hidden app-bottom-nav/);
});

test('Growth readiness remains independently associated with each training day', () => {
  const { app, document } = createApp();
  const state=app.getState();
  state.templateKey='growth';
  app.v7EnterFocus();
  app.setSessionReadiness('low',true);
  app.v7RenderFocus();
  assert.equal(document.getElementById('v7Energy').value,'low');
  assert.equal(document.getElementById('v7Joint').checked,true);
  app.v7ChangeDay(1);
  app.v7EnterFocus();
  assert.equal(document.getElementById('v7Energy').value,'unreported');
  assert.equal(document.getElementById('v7Joint').checked,false);
});

test('Precision Glass design is loaded after the base v0.7 stylesheet', () => {
  assert.match(html, /href="\/src\/v7.css"\s*\/?>[\s\S]*href="\/src\/v7-glass.css"/);
  assert.match(html, /class="v8-hero-watermark"/);
  assert.match(html, /class="v8-hero-context"/);
  assert.match(html, /id="v7WeightValueBtn"/);
  assert.match(html, /id="v7RepsValueBtn"/);
});

test('Floating nav uses coherent SVG icons and preserves real four-tab navigation', () => {
  const start=html.indexOf('<nav id="v7Nav"');
  const end=html.indexOf('</nav>',start);
  const nav=html.slice(start,end);
  assert.equal((nav.match(/data-v7tab="/g)||[]).length,4);
  assert.equal((nav.match(/<svg /g)||[]).length,4);
  assert.match(nav,/data-v7tab="today"/);
  assert.match(nav,/data-v7tab="settings"/);
});

test('Precision Glass settings keeps semantic tool IDs and SVG icons', () => {
  const ids=['v7RestPrefBtn','v7SoundBtn','v7PlateBtn','v7MeasurementsBtn','v7WeightsBtn','v7CalcBtn','v7ExportBtn','v7ImportBtn','v7ResetBtn'];
  ids.forEach(id=>assert.match(html,new RegExp('id="'+id+'"')));
  const start=html.indexOf('<section id="v7Settings"');
  const end=html.indexOf('</section>',start);
  const settings=html.slice(start,end);
  assert.ok((settings.match(/<svg /g)||[]).length>=8);
});

test('Home hero displays Ready, In progress, and Completed truthfully', () => {
  const { app, document } = createApp();
  app.v7RenderToday();
  assert.equal(document.getElementById('v8HeroState').textContent, 'Hazır');
  const first = app.getActiveWorkoutExercises()[0];
  app.recordExerciseSet(first.setKey, 0, 5, first.stats.weight);
  app.v7RenderToday();
  assert.equal(document.getElementById('v8HeroState').textContent, 'Devam ediyor');
  assert.equal(document.getElementById('v7StartLabel').textContent, 'Antrenmana Devam Et');
  recordAll(app);
  assert.equal(app.completeWorkoutSession(), true);
  app.getState().currentDayIdx = 0; // inspect completed session, not the next scheduled day
  app.v7RenderToday();
  assert.equal(document.getElementById('v8HeroState').textContent, 'Tamamlandı');
  assert.equal(document.getElementById('v7StartLabel').textContent, 'Kaydedilen Seansı Gör');
});

test('Precision Glass navigation uses scalable vector icons in focus and footer', () => {
  for (const id of ['v7FocusBackBtn','v7FocusMoreBtn','v7PreviousExerciseBtn','v7NextExerciseBtn']) {
    const index = html.indexOf('id="'+id+'"');
    assert.ok(index>=0);
    assert.match(html.slice(index,index+450), /<svg /);
  }
});

test('Visual Covers: five distinct cover surfaces are mounted in correct pages', () => {
  for (const cls of ['arm-cover-home','arm-cover-program','arm-cover-progress','arm-cover-settings']) {
    assert.match(html,new RegExp('class="[^"]*'+cls));
  }
  assert.match(html,/id="v7FocusHero" class="v7-hero v7-exercise-hero ui9-exercise-header"/);
  assert.ok(html.includes("v7Element('v7FocusHero').classList.toggle('arm-cover-focus'"));
});

test('Visual Covers: generated illustrations map to specific existing workouts only', () => {
  assert.match(html,/function v7ArtworkMarkup\(exId, fallbackSrc\)/);
  assert.match(html,/barbell_curl:'barbell'/);
  assert.match(html,/hammer_curl:'hammer'/);
  assert.match(html,/skull_crusher:'skull'/);
  const { app, document } = createApp();
  app.v7RenderToday();
  assert.equal(document.getElementById('v7TodayExercises').children.length,3);
  app.v7EnterFocus(0);
  assert.equal(document.getElementById('v7FocusHero').classList.contains('arm-cover-focus'),true);
  app.v7SelectExercise(1);
  assert.equal(document.getElementById('v7FocusHero').classList.contains('arm-cover-focus'),false);
});

test('Visual Covers: session data remains independent of imagery', () => {
  const { app }=createApp();
  const before=app.getSessionSnapshot().recordedSets;
  app.v7RenderToday(); app.v7RenderProgram(); app.v7RenderProgress();
  assert.equal(app.getSessionSnapshot().recordedSets,before);
  const first=app.getActiveWorkoutExercises()[0];
  assert.equal(app.recordExerciseSet(first.setKey,0,5,27.5),true);
  assert.equal(app.getSessionSnapshot().recordedSets,1);
});

test('Minimal UI v0.8 stylesheet supersedes the overgrown Glass theme', () => {
  assert.match(html, /href="\/src\/v7-glass.css"[\s\S]*href="\/src\/ui-system.css"/);
  assert.match(html, /class="v7-hero v7-home-hero arm-cover arm-cover-home ui-panel ui-next-session ui9-primary-panel"/);
  assert.match(html, /class="v7-navigation ui-tabbar"/);
  assert.match(html, /application-version" content="0\.9\.0-dev"/);
});

test('Exercise rows use consistent SVG icon thumbnails rather than mixed GIFs', () => {
  const { app, document } = createApp();
  app.v7RenderToday();
  const children=document.getElementById('v7TodayExercises').children;
  assert.equal(children.length,3);
  for(const row of children) {
    assert.match(row.innerHTML,/ui-exercise-mark/);
    assert.match(row.innerHTML,/<svg /);
    assert.ok(!row.innerHTML.includes('<img src='));
  }
});

test('Design has only one primary button and preserves existing set tracking', () => {
  const {app,document}=createApp();
  app.v7RenderToday();
  assert.equal(document.getElementById('v7HeroTitle').textContent,'Workout A');
  app.v7EnterFocus(0);
  app.v7EditValue('reps',-1);
  assert.equal(app.v7LogCurrentSet(),true);
  assert.equal(app.getSessionSnapshot().recordedSets,1);
  assert.equal(app.getActiveWorkoutExercises()[0].setValues[0],4);
});

test('The old generated cover layer remains in source but not required for app workflow', () => {
  assert.match(html,/id="v7TodayExercises"/);
  assert.match(html,/id="v7Focus"/);
  assert.match(html,/id="v7Program"/);
  assert.match(html,/id="v7Progress"/);
  assert.match(html,/id="v7Settings"/);
});

test('v0.9 quiet-ui stylesheet overrides the legacy glass and minimal layers last', () => {
  const order=['/src/v7-glass.css','/src/ui-system.css','/src/ui-v09.css'].map(x=>html.indexOf(x));
  assert.ok(order.every(v=>v>=0));
  assert.ok(order[0]<order[1]&&order[1]<order[2]);
  assert.match(html,/class="v7-card v7-work-control ui-panel ui-logger ui9-focus-logger"/);
  assert.match(html,/class="ui9-metrics-grid"/);
});

test('v0.9 focus separates true KG and repetitions into semantic controls', () => {
  const block=html.slice(html.indexOf('class="ui9-metrics-grid"'),html.indexOf('id="v7SetHint"'));
  assert.match(block,/role="group" aria-label="Çalışma ağırlığı"/);
  assert.match(block,/role="group" aria-label="Tekrar sayısı"/);
  for(const id of ['v7WeightMinus','v7WeightValueBtn','v7WeightPlus','v7RepsMinus','v7RepsValueBtn','v7RepsPlus']) {
    assert.match(block,new RegExp('id="'+id+'"'));
  }
});

test('v0.9 compact focus still logs actual changed values and advances sets', () => {
  const {app,document}=createApp();
  app.v7EnterFocus(0);
  app.v7EditValue('weight',-.5);
  app.v7EditValue('reps',1);
  assert.equal(app.v7LogCurrentSet(),true);
  assert.equal(app.getSessionSnapshot().recordedSets,1);
  assert.equal(app.getActiveWorkoutExercises()[0].setValues[0],6);
  assert.equal(app.getActiveWorkoutExercises()[0].setWeights[0],27);
  assert.equal(document.getElementById('v7ExercisePrescription').textContent,'5 × 5 tekrar · 1/5 set');
});
