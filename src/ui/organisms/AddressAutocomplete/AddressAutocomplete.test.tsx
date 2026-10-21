import { fireEvent, screen } from '@testing-library/react-native';

import { renderInTheme } from '@/test/render-in-theme';

import { AddressAutocomplete } from './AddressAutocomplete';

const OPTIONS = [
  { id: 'a', title: 'Calle Mayor 14, 28013 Madrid' },
  { id: 'b', title: 'Calle Mayor 14, 28110 Algete' },
] as const;

const BASE_PROPS = {
  label: 'Dirección',
  value: 'calle mayor 14',
  onChangeText: jest.fn(),
  options: [],
  onOptionSelect: jest.fn(),
} as const;

describe('AddressAutocomplete', () => {
  it('shows the field with what has been typed and no list when there are no options', () => {
    renderInTheme(<AddressAutocomplete {...BASE_PROPS} />);

    expect(screen.getByDisplayValue('calle mayor 14')).toBeOnTheScreen();
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it('reports what the person types', () => {
    const onChangeText = jest.fn();
    renderInTheme(<AddressAutocomplete {...BASE_PROPS} onChangeText={onChangeText} />);

    fireEvent.changeText(screen.getByLabelText('Dirección'), 'calle mayor 15');

    expect(onChangeText).toHaveBeenCalledWith('calle mayor 15');
  });

  it('lists the options and reports the chosen one', () => {
    const onOptionSelect = jest.fn();
    renderInTheme(
      <AddressAutocomplete {...BASE_PROPS} options={OPTIONS} onOptionSelect={onOptionSelect} />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Calle Mayor 14, 28110 Algete' }));

    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(onOptionSelect).toHaveBeenCalledWith('b');
  });

  it('credits the source of the suggestions only while they are shown', () => {
    const { unmount } = renderInTheme(
      <AddressAutocomplete {...BASE_PROPS} attributionText="© OpenStreetMap contributors" />,
    );
    expect(screen.queryByText('© OpenStreetMap contributors')).toBeNull();
    unmount();

    renderInTheme(
      <AddressAutocomplete
        {...BASE_PROPS}
        options={OPTIONS}
        attributionText="© OpenStreetMap contributors"
      />,
    );

    expect(screen.getByText('© OpenStreetMap contributors')).toBeOnTheScreen();
  });

  it('says in words that it is searching and why there is nothing to show', () => {
    renderInTheme(
      <AddressAutocomplete
        {...BASE_PROPS}
        searchingMessage="Buscando direcciones…"
        statusMessage="No encontramos esa dirección"
      />,
    );

    expect(screen.getByText('Buscando direcciones…')).toBeOnTheScreen();
    expect(screen.getByText('No encontramos esa dirección')).toBeOnTheScreen();
  });

  it('shows the validation error of the field', () => {
    renderInTheme(<AddressAutocomplete {...BASE_PROPS} errorMessage="Dirección demasiado larga" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Dirección demasiado larga');
  });
});
