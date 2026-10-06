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
> & {
  /** La pantalla pinta su propio título: aquí solo queda la identidad del centro. */
  isTitleHidden?: boolean;
};

/** Lo de arriba de la pantalla: la marca del centro (si es de un centro) y la cabecera. */
export function ScreenTemplateTop({
  hasPlatformHeroBackground = false,
  isTitleHidden = false,
  ...headerProps
}: Readonly<ScreenTemplateTopProps>): React.JSX.Element {
  return (
    <>
      {hasPlatformHeroBackground ? null : <CenterBrandBar />}
      {isTitleHidden ? null : <ScreenTemplateHeader {...headerProps} />}
    </>
  );
}
