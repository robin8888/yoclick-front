import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { useState } from 'react';

import { isLogoSmallEnough, LOGO_EDGE_PIXELS } from '../model/logo-image';

export interface PickedLogo {
  /** Para la vista previa local. */
  previewUri: string;
  dataBase64: string;
  contentType: 'image/png';
}

export type LogoPickProblem = 'too-large' | 'unreadable';

interface PickCenterLogo {
  pickedLogo: PickedLogo | null;
  problem: LogoPickProblem | null;
  isPreparing: boolean;
  pickLogo: () => void;
}

async function prepareSquareLogo(sourceUri: string): Promise<PickedLogo | null> {
  const context = ImageManipulator.manipulate(sourceUri);
  context.resize({ width: LOGO_EDGE_PIXELS, height: LOGO_EDGE_PIXELS });
  const renderedImage = await context.renderAsync();
  // PNG: conserva la transparencia de los logotipos.
  const savedImage = await renderedImage.saveAsync({ format: SaveFormat.PNG, base64: true });
  if (savedImage.base64 === undefined) return null;
  return { previewUri: savedImage.uri, dataBase64: savedImage.base64, contentType: 'image/png' };
}

/**
 * Elige el logo de la galería (recortado en cuadrado) y lo reduce a 512 px. El selector del
 * sistema no pide permiso: la app solo recibe la imagen que la persona elige.
 */
export function usePickCenterLogo(): PickCenterLogo {
  const [pickedLogo, setPickedLogo] = useState<PickedLogo | null>(null);
  const [problem, setProblem] = useState<LogoPickProblem | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);

  async function chooseAndPrepareLogo(): Promise<void> {
    const pickerResult = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    const chosenAsset = pickerResult.canceled ? undefined : pickerResult.assets[0];
    if (chosenAsset === undefined) return;
    setIsPreparing(true);
    const preparedLogo = await prepareSquareLogo(chosenAsset.uri);
    setIsPreparing(false);
    if (preparedLogo === null) setProblem('unreadable');
    else if (!isLogoSmallEnough(preparedLogo.dataBase64)) setProblem('too-large');
    else {
      setProblem(null);
      setPickedLogo(preparedLogo);
    }
  }

  return {
    pickedLogo,
    problem,
    isPreparing,
    pickLogo: () => {
      chooseAndPrepareLogo().catch(() => {
        setIsPreparing(false);
        setProblem('unreadable');
      });
    },
  };
}
