import { i18n } from './i18n';

/** Los textos fijos del aviso de «no se ha podido»: el mensaje concreto lo pone quien lo usa. */
export function getProblemModalCopy(): { title: string; dismissLabel: string } {
  return {
    title: i18n.t('problemModal.title'),
    dismissLabel: i18n.t('problemModal.dismiss'),
  };
}
