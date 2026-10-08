// API pública de la feature: lo único que `app/` y otras features pueden importar.
export { EditRoutineScreen } from './screens/EditRoutineScreen';
export { NewRoutineScreen } from './screens/NewRoutineScreen';
export { RoutineDetailScreen } from './screens/RoutineDetailScreen';
export { RoutinesScreen } from './screens/RoutinesScreen';
export { useMyRoutines } from './hooks/useRoutineQueries';
export { useRecordRoutineCompletion } from './hooks/useRoutineMutations';
export { ExerciseRows } from './components/ExerciseRows';
