import type { ClientImportWizard } from '../hooks/useClientImportWizard';
import { ImportColumnsStep } from './ImportColumnsStep';
import { ImportDoneStep } from './ImportDoneStep';
import { ImportFileStep } from './ImportFileStep';
import { ImportReviewStep } from './ImportReviewStep';

interface ImportStepContentProps {
  wizard: ClientImportWizard;
  clientWord: string;
  onSeeClientsPress: () => void;
}

/** Revisión y resultado: lo que ocurre una vez elegidas las columnas. */
function ImportFinalSteps({
  wizard,
  clientWord,
  onSeeClientsPress,
}: Readonly<ImportStepContentProps>): React.JSX.Element | null {
  const { step, report } = wizard;
  if (step === 'done' && report) {
    return (
      <ImportDoneStep
        report={report}
        clientWord={clientWord}
        onSeeClientsPress={onSeeClientsPress}
        onImportAnotherPress={wizard.restart}
      />
    );
  }
  return (
    <ImportReviewStep
      summary={wizard.summary}
      clientWord={clientWord}
      errorMessage={wizard.importErrorMessage}
      onImportPress={wizard.startImport}
    />
  );
}

/** El paso en el que está el asistente de importación. */
export function ImportStepContent({
  wizard,
  clientWord,
  onSeeClientsPress,
}: Readonly<ImportStepContentProps>): React.JSX.Element | null {
  const { step, loadedFile } = wizard;
  if (step === 'columns' && loadedFile) {
    return (
      <ImportColumnsStep
        loadedFile={loadedFile}
        canReview={wizard.canReview}
        onFieldSelect={wizard.setColumnField}
        onReviewPress={wizard.goToReview}
      />
    );
  }
  if (step === 'review' || step === 'done') {
    return (
      <ImportFinalSteps
        wizard={wizard}
        clientWord={clientWord}
        onSeeClientsPress={onSeeClientsPress}
      />
    );
  }
  return (
    <ImportFileStep
      clientWord={clientWord}
      errorMessage={wizard.fileErrorMessage}
      onChooseFilePress={wizard.chooseFile}
    />
  );
}
