// Event delegation for primary app navigation and active workout controls.
// This module never imports application state or manipulates storage directly.
const nonnegativeIndex = raw => {
  if (typeof raw !== 'string' || !/^(0|[1-9]\d*)$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value : null;
};

export function registerUIActions(root, callbacks) {
  const activate = control => {
    const data = control.dataset;
    switch (data.uiAction) {
      case 'navigate':
        if (['home', 'prog', 'hist', 'stat', 'set'].includes(data.uiTab)) callbacks.navigate(data.uiTab);
        break;
      case 'log-set': {
        const exercise = nonnegativeIndex(data.uiExercise);
        const set = nonnegativeIndex(data.uiSet);
        if (exercise !== null && set !== null) callbacks.logSet(exercise, set);
        break;
      }
      case 'edit-exercise': {
        const exercise = nonnegativeIndex(data.uiExercise);
        if (exercise !== null) callbacks.editExercise(exercise);
        break;
      }
      case 'view-workout':
        if (data.uiView === 'a' || data.uiView === 'w') callbacks.viewWorkout(data.uiView);
        break;
      case 'finish-workout': callbacks.finishWorkout(); break;
      case 'close-workout': callbacks.closeWorkout(); break;
      case 'discard-workout': callbacks.discardWorkout(); break;
      case 'skip-rest': callbacks.skipRest(); break;
      case 'show-note': callbacks.showNote(); break;
      default: break;
    }
  };
  root.addEventListener('click', event => {
    const control=event.target?.closest?.('[data-ui-action]');
    if (control) activate(control);
  });
  root.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const control=event.target?.closest?.('[data-ui-action][role="button"]');
    if (!control) return;
    event.preventDefault();
    activate(control);
  });
  root.addEventListener('input', event => {
    const field=event.target?.closest?.('[data-ui-note]');
    if (field) callbacks.updateNote(field.value);
  });
}
