import { Logo } from '@/ui/atoms/Logo';

// Logotipo completo en blanco, del mismo tamaño que en «Unirse», el inicio de sesión y el registro.
const MFA_LOGO_HEIGHT = 110;

/** El logotipo de Yoclick sobre el título de las pantallas de verificación en dos pasos. */
export function MfaScreenLogo(): React.JSX.Element {
  return <Logo variant="lockup" height={MFA_LOGO_HEIGHT} />;
}
