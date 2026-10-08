import { AuthBrandHeader } from './AuthBrandHeader';

// Logotipo completo en blanco, del mismo tamaño que en «Unirse», el inicio de sesión y el registro.
const MFA_LOGO_HEIGHT = 110;

/** El logotipo de Yoclick (o el del centro que invita) sobre el título de la verificación en dos pasos. */
export function MfaScreenLogo(): React.JSX.Element {
  return <AuthBrandHeader platformLogoHeight={MFA_LOGO_HEIGHT} />;
}
