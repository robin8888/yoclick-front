import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { IMPORT_FIELDS, type ImportField } from '../model/client-import-rows';
import {
  createFieldChoiceStyle,
  createImportColumnCardStyle,
  FIELD_CHOICES_STYLE,
} from './ImportColumnRow.styles';

interface FieldChoiceProps {
  field: ImportField;
  isSelected: boolean;
  onPress: () => void;
}

function FieldChoice({
  field,
  isSelected,
  onPress,
}: Readonly<FieldChoiceProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      role="radio"
      accessibilityState={{ checked: isSelected }}
      onPress={onPress}
      style={createFieldChoiceStyle(theme, isSelected)}
    >
      {isSelected ? <Icon name="check" size="inline" color="brandInk" /> : null}
      <Text variant="caption" color={isSelected ? 'brandInk' : 'ink'}>
        {i18n.t(`centerAdmin.importClients.columns.fields.${field}`)}
      </Text>
    </Pressable>
  );
}

interface ImportColumnRowProps {
  columnTitle: string;
  exampleValue: string;
  selectedField: ImportField;
  onFieldSelect: (field: ImportField) => void;
}

/** Una columna del archivo con un ejemplo de su contenido y qué dato es. */
export function ImportColumnRow({
  columnTitle,
  exampleValue,
  selectedField,
  onFieldSelect,
}: Readonly<ImportColumnRowProps>): React.JSX.Element {
  const theme = useTheme();
  const exampleText =
    exampleValue === ''
      ? i18n.t('centerAdmin.importClients.columns.emptyExample')
      : i18n.t('centerAdmin.importClients.columns.example', { example: exampleValue });

  return (
    <View style={createImportColumnCardStyle(theme)}>
      <View>
        <Text variant="bodyStrong">{columnTitle}</Text>
        <Text variant="caption" color="ink2">
          {exampleText}
        </Text>
      </View>
      <View
        role="radiogroup"
        accessibilityLabel={i18n.t('centerAdmin.importClients.columns.fieldGroupLabel', {
          column: columnTitle,
        })}
        style={FIELD_CHOICES_STYLE}
      >
        {IMPORT_FIELDS.map((field) => (
          <FieldChoice
            key={field}
            field={field}
            isSelected={field === selectedField}
            onPress={() => {
              onFieldSelect(field);
            }}
          />
        ))}
      </View>
    </View>
  );
}
