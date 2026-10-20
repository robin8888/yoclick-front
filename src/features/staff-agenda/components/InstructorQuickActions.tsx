import { useRouter, type Href } from 'expo-router';

import { useUnreadMessageCount } from '@/features/chat';
import { useActiveCenterModules, type CenterModules } from '@/features/join';

import { i18n } from '@/shared/i18n';
import type { IconName } from '@/ui/atoms/Icon';

import { QuickActionsGrid, type QuickAction } from '@/ui/organisms/QuickActionsGrid';

interface ActionSpec {
  id: string;
  iconName: IconName;
  route: Href;
  /** `null`: el nombre es la palabra del sector (rutinas, tareas…) que pone quien llama. */
  labelKey:
    | 'staffAgenda.instructor.home.agendaAction'
    | 'timeClock.workQrAction'
    | 'timeClock.title'
    | 'attendance.scan.openAction'
    | 'content.admin.title'
    | 'session.profile.availabilityAction'
    | 'chat.title'
    | null;
  hintKey:
    | 'staffAgenda.instructor.home.agendaHint'
    | 'staffAgenda.instructor.home.workQrHint'
    | 'staffAgenda.instructor.home.attendanceHint'
    | 'staffAgenda.instructor.home.scanHint'
    | 'staffAgenda.instructor.home.routinesHint'
    | 'staffAgenda.instructor.home.contentHint'
    | 'staffAgenda.instructor.home.availabilityHint'
    | 'staffAgenda.instructor.home.messagesHint';
}

/** Mi agenda es lo que más se usa: va arriba, a todo el ancho. */
const PRIMARY_SPEC: ActionSpec = {
  id: 'agenda',
  iconName: 'calendar',
  route: '/(staff)/day-agenda',
  labelKey: 'staffAgenda.instructor.home.agendaAction',
  hintKey: 'staffAgenda.instructor.home.agendaHint',
};

const SECONDARY_SPECS: readonly ActionSpec[] = [
  {
    id: 'work-qr',
    iconName: 'qrCode',
    route: '/(staff)/work-qr',
    labelKey: 'timeClock.workQrAction',
    hintKey: 'staffAgenda.instructor.home.workQrHint',
  },
  {
    id: 'attendance',
    iconName: 'clock',
    route: '/(staff)/attendance',
    labelKey: 'timeClock.title',
    hintKey: 'staffAgenda.instructor.home.attendanceHint',
  },
  {
    id: 'scan',
    iconName: 'qrCode',
    route: '/(staff)/scan',
    labelKey: 'attendance.scan.openAction',
    hintKey: 'staffAgenda.instructor.home.scanHint',
  },
  {
    id: 'routines',
    iconName: 'play',
    route: '/(staff)/routines',
    labelKey: null,
    hintKey: 'staffAgenda.instructor.home.routinesHint',
  },
  {
    id: 'content',
    iconName: 'file',
    route: '/(staff)/content',
    labelKey: 'content.admin.title',
    hintKey: 'staffAgenda.instructor.home.contentHint',
  },
  {
    id: 'messages',
    iconName: 'messageCircle',
    route: '/(staff)/messages',
    labelKey: 'chat.title',
    hintKey: 'staffAgenda.instructor.home.messagesHint',
  },
  {
    id: 'availability',
    iconName: 'calendar',
    route: '/(staff)/availability',
    labelKey: 'session.profile.availabilityAction',
    hintKey: 'staffAgenda.instructor.home.availabilityHint',
  },
];

/** Escáner, rutinas y contenido solo salen si el centro usa asistencia y contenido. */
function listVisibleSpecs(modules: CenterModules): readonly ActionSpec[] {
  const hiddenIds = [
    ...(modules.attendance ? [] : ['scan']),
    ...(modules.content ? [] : ['routines', 'content']),
  ];
  return SECONDARY_SPECS.filter((spec) => !hiddenIds.includes(spec.id));
}

interface InstructorQuickActionsProps {
  /** «Rutinas», «tareas», «prácticas»…: la palabra del sector, ya en plural y con mayúscula. */
  routineLabel: string;
}

/** Fichar, asistencia, escáner y mis cosas debajo de Mi agenda: los accesos del profesor. */
export function InstructorQuickActions({
  routineLabel,
}: Readonly<InstructorQuickActionsProps>): React.JSX.Element {
  const router = useRouter();
  const unreadMessageCount = useUnreadMessageCount();
  const modules = useActiveCenterModules();
  const toAction = (spec: ActionSpec): QuickAction => ({
    id: spec.id,
    iconName: spec.iconName,
    label: spec.labelKey === null ? routineLabel : i18n.t(spec.labelKey),
    hint: i18n.t(spec.hintKey),
    ...(spec.id === 'messages' ? { badgeCount: unreadMessageCount } : {}),
    onPress: () => {
      router.push(spec.route);
    },
  });

  return (
    <QuickActionsGrid
      primaryAction={toAction(PRIMARY_SPEC)}
      actions={listVisibleSpecs(modules).map(toAction)}
    />
  );
}
