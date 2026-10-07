import {
  addExercise,
  buildCreateRoutineRequest,
  canSaveRoutine,
  EMPTY_ROUTINE_DRAFT,
  emptyTargetOfKind,
  isExerciseInDraft,
  MAX_ROUTINE_EXERCISES,
  removeExercise,
  setExerciseVideo,
  setPrescription,
  type RoutineDraft,
} from './routine-draft';

const SQUAT = { key: 'k1', name: 'Sentadilla goblet', category: 'Piernas' };
const PLANK = { key: 'k2', name: 'Plancha frontal', category: 'Core' };

describe('adding and removing exercises', () => {
  it('adds exercises at the end, with an empty prescription', () => {
    const draft = addExercise(addExercise(EMPTY_ROUTINE_DRAFT, SQUAT), PLANK);

    expect(draft.exercises.map(({ name }) => name)).toEqual([
      'Sentadilla goblet',
      'Plancha frontal',
    ]);
    expect(draft.exercises[0]?.prescription).toBe('');
  });

  it('trims the name and ignores a blank one', () => {
    const withBlank = addExercise(EMPTY_ROUTINE_DRAFT, { key: 'k', name: '   ', category: '' });
    const trimmed = addExercise(EMPTY_ROUTINE_DRAFT, {
      key: 'k',
      name: ' Dead bug ',
      category: '',
    });

    expect(withBlank.exercises).toEqual([]);
    expect(trimmed.exercises[0]?.name).toBe('Dead bug');
  });

  it('does not grow past the limit of the server', () => {
    const full = Array.from({ length: MAX_ROUTINE_EXERCISES }, (_unused, index) => ({
      key: `k${String(index)}`,
      name: `Ejercicio ${String(index)}`,
      category: '',
      prescription: '',
      video: null,
    }));
    const draft: RoutineDraft = { ...EMPTY_ROUTINE_DRAFT, exercises: full };

    expect(addExercise(draft, SQUAT).exercises).toHaveLength(MAX_ROUTINE_EXERCISES);
  });

  it('removes an exercise by its key', () => {
    const draft = addExercise(addExercise(EMPTY_ROUTINE_DRAFT, SQUAT), PLANK);

    expect(removeExercise(draft, 'k1').exercises.map(({ key }) => key)).toEqual(['k2']);
  });

  it('knows which exercises are already in the routine', () => {
    const draft = addExercise(EMPTY_ROUTINE_DRAFT, SQUAT);

    expect(isExerciseInDraft(draft, 'Sentadilla goblet')).toBe(true);
    expect(isExerciseInDraft(draft, 'Plancha frontal')).toBe(false);
  });

  it('sets the prescription of one exercise only', () => {
    const draft = setPrescription(
      addExercise(addExercise(EMPTY_ROUTINE_DRAFT, SQUAT), PLANK),
      'k2',
      '3 × 40 s',
    );

    expect(draft.exercises.map(({ prescription }) => prescription)).toEqual(['', '3 × 40 s']);
  });
});

describe('canSaveRoutine', () => {
  const withExercise = addExercise(EMPTY_ROUTINE_DRAFT, SQUAT);

  it.each([
    {
      caseName: 'a name and an exercise',
      draft: { ...withExercise, name: 'Fuerza' },
      isExpectedSavable: true,
    },
    { caseName: 'no name', draft: { ...withExercise, name: '  ' }, isExpectedSavable: false },
    {
      caseName: 'no exercises',
      draft: { ...EMPTY_ROUTINE_DRAFT, name: 'Fuerza' },
      isExpectedSavable: false,
    },
  ])('is $isExpectedSavable with $caseName', ({ draft, isExpectedSavable }) => {
    expect(canSaveRoutine(draft)).toBe(isExpectedSavable);
  });
});

describe('choosing who gets the routine', () => {
  const ready = { ...addExercise(EMPTY_ROUTINE_DRAFT, SQUAT), name: 'Fuerza' };

  it('cannot be saved while the person or the group has not been chosen', () => {
    expect(canSaveRoutine({ ...ready, target: emptyTargetOfKind('client') })).toBe(false);
    expect(canSaveRoutine({ ...ready, target: emptyTargetOfKind('group') })).toBe(false);
  });

  it('can be saved once a target is chosen, or with nobody', () => {
    expect(canSaveRoutine({ ...ready, target: { kind: 'group', groupId: 'g1', name: 'A' } })).toBe(
      true,
    );
    expect(canSaveRoutine({ ...ready, target: emptyTargetOfKind('none') })).toBe(true);
  });
});

describe('buildCreateRoutineRequest', () => {
  const base: RoutineDraft = {
    name: ' Fuerza base ',
    note: ' Descansa 90 s ',
    exercises: [
      {
        key: 'k1',
        name: 'Sentadilla goblet',
        category: 'Piernas',
        prescription: ' 4 × 10 ',
        video: null,
      },
      { key: 'k2', name: 'Mi ejercicio', category: '', prescription: '', video: null },
    ],
    target: { kind: 'none' },
  };

  it('trims the texts and turns blanks into nulls', () => {
    expect(buildCreateRoutineRequest(base)).toEqual({
      name: 'Fuerza base',
      note: 'Descansa 90 s',
      items: [
        { name: 'Sentadilla goblet', category: 'Piernas', prescription: '4 × 10', videoId: null },
        { name: 'Mi ejercicio', category: null, prescription: null, videoId: null },
      ],
    });
  });

  it('assigns to a client or to a group when one is chosen', () => {
    const toClient = buildCreateRoutineRequest({
      ...base,
      target: { kind: 'client', membershipId: 'm1', name: 'Ana' },
    });
    const toGroup = buildCreateRoutineRequest({
      ...base,
      target: { kind: 'group', groupId: 'g1', name: 'Fuerza 50+' },
    });

    expect(toClient.assignTo).toEqual({ clientMembershipId: 'm1' });
    expect(toGroup.assignTo).toEqual({ groupId: 'g1' });
  });
});

describe('videos in the exercises', () => {
  const READY_VIDEO = {
    id: 'video-1',
    title: 'Sentadilla',
    status: 'ready',
    reviewStatus: 'approved',
    reviewNote: null,
    durationSeconds: 42,
    playback: null,
  } as const;

  it('attaches a video to one exercise only and detaches it', () => {
    const draft = addExercise(addExercise(EMPTY_ROUTINE_DRAFT, SQUAT), PLANK);

    const withVideo = setExerciseVideo(draft, 'k1', READY_VIDEO);
    const withoutVideo = setExerciseVideo(withVideo, 'k1', null);

    expect(withVideo.exercises.map(({ video }) => video?.id ?? null)).toEqual(['video-1', null]);
    expect(withoutVideo.exercises.every(({ video }) => video === null)).toBe(true);
  });

  it('sends the id of the video with the exercise', () => {
    const draft = setExerciseVideo(
      {
        ...EMPTY_ROUTINE_DRAFT,
        name: 'Fuerza',
        exercises: addExercise(EMPTY_ROUTINE_DRAFT, SQUAT).exercises,
      },
      'k1',
      READY_VIDEO,
    );

    expect(buildCreateRoutineRequest(draft).items).toEqual([
      { name: 'Sentadilla goblet', category: 'Piernas', prescription: null, videoId: 'video-1' },
    ]);
  });
});
