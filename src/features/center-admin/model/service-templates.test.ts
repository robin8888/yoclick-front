import { serviceFormSchema } from './service-form';
import {
  buildFormFromTemplate,
  getDefaultTemplatePackId,
  getServiceTemplates,
  SERVICE_TEMPLATE_IDS,
  TEMPLATE_PACK_IDS,
} from './service-templates';

describe('getDefaultTemplatePackId', () => {
  it.each([
    { sectorId: 'yoga', expected: 'yoga' },
    { sectorId: 'gym', expected: 'gym' },
    { sectorId: 'otro', expected: 'generic' },
    { sectorId: 'sector-nuevo', expected: 'generic' },
    { sectorId: null, expected: 'generic' },
    { sectorId: undefined, expected: 'generic' },
  ])('starts at $expected for the sector $sectorId', ({ sectorId, expected }) => {
    expect(getDefaultTemplatePackId(sectorId)).toBe(expected);
  });
});

describe('service templates', () => {
  it('offers examples for businesses of appointments that are not in any sector', () => {
    expect(TEMPLATE_PACK_IDS).toEqual(
      expect.arrayContaining(['peluqueria', 'estetica', 'fisioterapia', 'psicologia']),
    );
  });

  it('gives every pack examples that exist and are not repeated inside the pack', () => {
    for (const packId of TEMPLATE_PACK_IDS) {
      const ids = getServiceTemplates(packId).map(({ id }) => id);
      expect(ids.length).toBeGreaterThan(0);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(SERVICE_TEMPLATE_IDS).toContain(id);
    }
  });

  it('builds a form that passes the service validation, with the price left to the owner', () => {
    for (const packId of TEMPLATE_PACK_IDS) {
      for (const serviceTemplate of getServiceTemplates(packId)) {
        const formValues = buildFormFromTemplate(serviceTemplate, {
          name: 'Corte de pelo',
          description: 'Con lavado',
        });

        expect(serviceFormSchema.safeParse(formValues).success).toBe(true);
        expect(formValues.priceInEuros).toBe('');
      }
    }
  });
});
