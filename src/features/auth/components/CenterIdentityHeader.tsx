import { resolveApiAssetUrl } from '@/shared/api/asset-url';
import { SignedInIdentity } from '@/features/join';
import { Avatar } from '@/ui/atoms/Avatar';

interface CenterIdentityHeaderProps {
  centerName: string;
  /** Ruta relativa del logo del centro, si tiene. */
  logoUrl: string | null;
}

/** Avatar del centro con el rol y el nombre de quien ha entrado debajo. */
export function CenterIdentityHeader({
  centerName,
  logoUrl,
}: Readonly<CenterIdentityHeaderProps>): React.JSX.Element {
  return (
    <>
      <Avatar name={centerName} photoUrl={resolveApiAssetUrl(logoUrl)} size="xl" isDecorative />
      <SignedInIdentity tone="center" />
    </>
  );
}
