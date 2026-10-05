import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { VerificationCodeBoxes } from './VerificationCodeBoxes';

function renderBoxes(overrides: { value?: string; errorMessage?: string } = {}): jest.Mock {
  const onValueChange = jest.fn();
  renderInTheme(
    <VerificationCodeBoxes
      value={overrides.value ?? ''}
      accessibilityLabel="Código de verificación"
      errorMessage={overrides.errorMessage}
      onValueChange={onValueChange}
      onBlur={jest.fn()}
      onSubmitEditing={jest.fn()}
    />,
  );
  return onValueChange;
}

describe('VerificationCodeBoxes', () => {
  it('is one labelled field for the screen reader, with a numeric keyboard and autofill', () => {
    renderBoxes();

    const codeInput = screen.getByLabelText('Código de verificación');
    expect(codeInput.props.keyboardType).toBe('number-pad');
    expect(codeInput.props.textContentType).toBe('oneTimeCode');
    expect(codeInput.props.maxLength).toBe(6);
  });

  it('shows each typed digit in its own box', () => {
    renderBoxes({ value: '123' });

    expect(screen.getByText('1', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.getByText('2', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.getByText('3', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it.each([
    ['12a3 4-5', '12345'],
    ['1234567890', '123456'],
    ['abc', ''],
  ])('keeps only up to six digits of %s', (typedText, expectedCode) => {
    const onValueChange = renderBoxes();

    fireEvent.changeText(screen.getByLabelText('Código de verificación'), typedText);

    expect(onValueChange).toHaveBeenCalledWith(expectedCode);
  });

  it('announces the error under the boxes', () => {
    renderBoxes({ errorMessage: 'El código no es válido' });

    expect(screen.getByRole('alert')).toHaveTextContent('El código no es válido');
  });
});
