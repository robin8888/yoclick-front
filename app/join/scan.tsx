// Import directo y no desde el índice de la feature: así `expo-camera` (módulo nativo) solo se
// carga al abrir esta ruta y un build sin el módulo no rompe el resto de «Unirse».
import { JoinScanScreen } from '@/features/join/screens/JoinScanScreen';

export default function JoinScanRoute(): React.JSX.Element {
  return <JoinScanScreen />;
}
