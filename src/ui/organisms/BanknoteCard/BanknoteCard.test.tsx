import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { BanknoteCard } from './BanknoteCard';

const BASE_PROPS = {
  title: 'Bono 10 clases',
  valueText: '6',
  unitText: 'clases',
  detailLines: ['Caduca el 1 dic', 'Vale para todos los servicios'],
  serialText: 'Nº 4F2A91',
  stampText: 'Activo',
  accessibilityLabel: 'Bono 10 clases. Activo. Te quedan 6 clases',
} as const;

describe('BanknoteCard', () => {
  it('shows the title, the big figure, the details, the serial number and the stamp', () => {
    renderInTheme(<BanknoteCard {...BASE_PROPS} />);

    expect(screen.getByText('Bono 10 clases')).toBeOnTheScreen();
    // La cifra sale grande y repetida en el recuadro del pie, como en un billete.
    expect(screen.getAllByText('6')).toHaveLength(2);
    expect(screen.getByText('clases')).toBeOnTheScreen();
    expect(screen.getByText('Caduca el 1 dic')).toBeOnTheScreen();
    expect(screen.getByText('Nº 4F2A91')).toBeOnTheScreen();
    expect(screen.getByText('Activo')).toBeOnTheScreen();
  });

  it('is read as one thing by the screen reader', () => {
    renderInTheme(<BanknoteCard {...BASE_PROPS} />);

    expect(screen.getByLabelText(BASE_PROPS.accessibilityLabel)).toBeOnTheScreen();
  });

  it('becomes a button when it has an action', () => {
    const onPress = jest.fn();
    renderInTheme(<BanknoteCard {...BASE_PROPS} onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: BASE_PROPS.accessibilityLabel }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows the actions in a strip under the note', () => {
    renderInTheme(
      <BanknoteCard {...BASE_PROPS} tone="pending">
        <Text>Pedir</Text>
      </BanknoteCard>,
    );

    expect(screen.getByText('Pedir')).toBeOnTheScreen();
  });
});
