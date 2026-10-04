export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  /** Nombre de la persona: da las iniciales y el texto alternativo. */
  name: string;
  /** Sin foto (o si falla la carga) se muestran las iniciales sobre `surface2`. */
  photoUrl?: string | null | undefined;
  size?: AvatarSize;
  /** Si el nombre ya aparece al lado, el avatar se oculta del lector de pantalla. */
  isDecorative?: boolean;
}
