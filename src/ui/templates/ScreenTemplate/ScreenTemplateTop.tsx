import { CenterBrandBar } from './CenterBrandBar';
import type { ScreenTemplateProps } from './ScreenTemplate.types';
import { ScreenTemplateHeader } from './ScreenTemplateHeader';

type ScreenTemplateTopProps = Pick<
  ScreenTemplateProps,
  | 'title'
  | 'subtitle'
  | 'onBackPress'
  | 'backLabel'
  | 'headerAccessory'
  | 'isHeaderCentered'
  | 'hasPlatformHeroBackground'
>;

/** Lo de arriba de la pantalla: la marca del centro (si es de un centro) y la cabecera. */
export function ScreenTemplateTop({
  hasPlatformHeroBackground = false,
  ...headerProps
}: Readonly<ScreenTemplateTopProps>): React.JSX.Element {
  return (
    <>
      {hasPlatformHeroBackground ? null : <CenterBrandBar />}
      <ScreenTemplateHeader {...headerProps} />
    </>
  );
}
