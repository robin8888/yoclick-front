import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useActiveCenterSectorId } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Chip } from '@/ui/atoms/Chip';
import { Text } from '@/ui/atoms/Text';

import type { useServiceEditorForm } from '../hooks/useServiceEditorForm';
import type { ServiceFormValues } from '../model/service-form';
import {
  buildFormFromTemplate,
  getDefaultTemplatePackId,
  getServiceTemplates,
  TEMPLATE_PACK_IDS,
  type TemplatePackId,
} from '../model/service-templates';

type ServiceEditorForm = ReturnType<typeof useServiceEditorForm>;

const PICKER_STYLE = { gap: 8 } as const;
const CHIPS_STYLE = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as const;
const PACK_CHIPS_STYLE = { flexDirection: 'row', gap: 8 } as const;

const TEMPLATE_FIELDS = [
  'name',
  'description',
  'durationMinutes',
  'bufferMinutes',
  'mode',
] as const satisfies readonly (keyof ServiceFormValues)[];

interface PackChipsProps {
  selectedPackId: TemplatePackId;
  onPackSelect: (packId: TemplatePackId) => void;
}

function PackChips({ selectedPackId, onPackSelect }: Readonly<PackChipsProps>): React.JSX.Element {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={i18n.t('centerAdmin.serviceTemplates.packsLabel')}
      contentContainerStyle={PACK_CHIPS_STYLE}
    >
      {TEMPLATE_PACK_IDS.map((packId) => (
        <Chip
          key={packId}
          selectionRole="radio"
          label={i18n.t(`centerAdmin.serviceTemplates.packs.${packId}`)}
          isSelected={packId === selectedPackId}
          onPress={() => {
            onPackSelect(packId);
          }}
        />
      ))}
    </ScrollView>
  );
}

function TemplateChips({
  packId,
  form,
}: Readonly<{ packId: TemplatePackId; form: ServiceEditorForm }>): React.JSX.Element {
  return (
    <View style={CHIPS_STYLE}>
      {getServiceTemplates(packId).map((serviceTemplate) => {
        const texts = {
          name: i18n.t(`centerAdmin.serviceTemplates.items.${serviceTemplate.id}.name`),
          description: i18n.t(
            `centerAdmin.serviceTemplates.items.${serviceTemplate.id}.description`,
          ),
        };
        return (
          <Button
            key={serviceTemplate.id}
            label={texts.name}
            variant="outline"
            size="sm"
            onPress={() => {
              const values = buildFormFromTemplate(serviceTemplate, texts);
              for (const field of TEMPLATE_FIELDS) form.setValue(field, values[field]);
            }}
          />
        );
      })}
    </View>
  );
}

/**
 * Solo en un servicio nuevo: ejemplos por tipo de negocio que rellenan el formulario. Empieza en el
 * tipo del sector del centro, pero se puede mirar cualquier otro (una peluquería es del sector «otro»).
 * No crea nada: todo se puede cambiar y solo se guarda al pulsar «Guardar».
 */
export function ServiceTemplatePicker({
  form,
}: Readonly<{ form: ServiceEditorForm }>): React.JSX.Element {
  const defaultPackId = getDefaultTemplatePackId(useActiveCenterSectorId());
  const [pickedPackId, setPickedPackId] = useState<TemplatePackId | null>(null);
  const packId = pickedPackId ?? defaultPackId;

  return (
    <View style={PICKER_STYLE}>
      <Text variant="bodyStrong">{i18n.t('centerAdmin.serviceTemplates.title')}</Text>
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.serviceTemplates.hint')}
      </Text>
      <PackChips selectedPackId={packId} onPackSelect={setPickedPackId} />
      <TemplateChips packId={packId} form={form} />
    </View>
  );
}
