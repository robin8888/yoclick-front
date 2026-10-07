import { Share, View } from 'react-native';

import type { CenterReportResponseDtoStaffItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { buildStaffReportCsv, formatReportPercent } from '../model/report-view';
import {
  createReportCardStyle,
  createTableRowStyle,
  REPORT_HEADER_ROW_STYLE,
  TABLE_NUMBER_COLUMN_STYLE,
  TABLE_TEXT_COLUMN_STYLE,
} from './ReportCard.styles';

interface StaffReportCardProps {
  staff: readonly CenterReportResponseDtoStaffItem[];
  staffWord: string;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** Abre el menú de compartir del sistema con el CSV: desde ahí se guarda o se envía. */
function shareStaffCsv({ staff, staffWord }: StaffReportCardProps): void {
  const csv = buildStaffReportCsv(
    [
      capitalize(staffWord),
      i18n.t('centerAdmin.reports.staffColumnSessions'),
      i18n.t('centerAdmin.reports.staffColumnHours'),
      `${i18n.t('centerAdmin.reports.staffColumnOccupancy')} %`,
    ],
    staff,
  );
  void Share.share({
    title: i18n.t('centerAdmin.reports.staffCsvTitle', { staffWord }),
    message: csv,
  });
}

function StaffRow({
  member,
}: Readonly<{ member: CenterReportResponseDtoStaffItem }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View accessible style={createTableRowStyle(theme)}>
      <View style={TABLE_TEXT_COLUMN_STYLE}>
        <Text variant="body">{member.fullName}</Text>
      </View>
      <View style={TABLE_NUMBER_COLUMN_STYLE}>
        <Text variant="body">{String(member.sessionCount)}</Text>
      </View>
      <View style={TABLE_NUMBER_COLUMN_STYLE}>
        <Text variant="body">{String(member.hours)}</Text>
      </View>
      <View style={TABLE_NUMBER_COLUMN_STYLE}>
        <Text variant="body">{formatReportPercent(member.occupancyPercent)}</Text>
      </View>
    </View>
  );
}

/** Prototipo `areports`, «Por instructor»: citas, horas y ocupación, con exportación a CSV. */
export function StaffReportCard(props: Readonly<StaffReportCardProps>): React.JSX.Element {
  const theme = useTheme();
  const { staff, staffWord } = props;

  return (
    <View style={createReportCardStyle(theme)}>
      <View style={REPORT_HEADER_ROW_STYLE}>
        <Text variant="titleMd" role="heading">
          {i18n.t('centerAdmin.reports.staffTitle', { staffWord })}
        </Text>
        <Button
          label={i18n.t('centerAdmin.reports.staffCsvAction')}
          accessibilityLabel={i18n.t('centerAdmin.reports.staffCsvLabel')}
          variant="ghost"
          size="sm"
          leadingIconName="download"
          isDisabled={staff.length === 0}
          onPress={() => {
            shareStaffCsv(props);
          }}
        />
      </View>
      {staff.length === 0 ? (
        <Text variant="caption" color="ink2">
          {i18n.t('centerAdmin.reports.emptyPeriod')}
        </Text>
      ) : (
        staff.map((member) => <StaffRow key={member.membershipId} member={member} />)
      )}
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.reports.staffNote')}
      </Text>
    </View>
  );
}
