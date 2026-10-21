import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useState } from 'react';

import { buildApiError, findApiCall, mockApi } from '@/test/mock-api';
import { renderScreen } from '@/test/render-screen';

import { EMPTY_ADDRESS, type AddressValue } from '../model/address-value';
import { AddressField } from './AddressField';

jest.mock('@/shared/api/api-mutator', () => ({ apiMutator: jest.fn() }));

const SUGGESTIONS_PATH = '/v1/geocode/suggestions';
const SEARCH_TIMEOUT_MS = 3000;
const MADRID_SUGGESTION = {
  label: 'Calle Mayor 14, 28013 Madrid',
  street: 'Calle Mayor',
  houseNumber: '14',
  city: 'Madrid',
  postcode: '28013',
  latitude: 40.41644,
  longitude: -3.70627,
};

function AddressFieldHarness({
  onChange,
}: Readonly<{ onChange: (address: AddressValue) => void }>): React.JSX.Element {
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  return (
    <AddressField
      label="Dirección"
      kind="address"
      countryCode="ES"
      value={address}
      onChange={(nextAddress) => {
        setAddress(nextAddress);
        onChange(nextAddress);
      }}
    />
  );
}

describe('AddressField', () => {
  it('suggests addresses while typing and fills in the point of the chosen one', async () => {
    mockApi({ [`POST ${SUGGESTIONS_PATH}`]: { suggestions: [MADRID_SUGGESTION] } });
    const onChange = jest.fn();
    renderScreen(<AddressFieldHarness onChange={onChange} />);

    fireEvent.changeText(screen.getByLabelText('Dirección'), 'calle mayor 14');
    fireEvent.press(
      await screen.findByRole(
        'button',
        { name: 'Calle Mayor 14, 28013 Madrid' },
        { timeout: SEARCH_TIMEOUT_MS },
      ),
    );

    expect(findApiCall('POST', SUGGESTIONS_PATH)?.body).toEqual({
      query: 'calle mayor 14',
      kind: 'address',
      countryCode: 'ES',
    });
    expect(onChange).toHaveBeenLastCalledWith({
      text: 'Calle Mayor 14, 28013 Madrid',
      latitude: 40.41644,
      longitude: -3.70627,
    });
    expect(screen.queryByRole('button', { name: /Calle Mayor 14/ })).toBeNull();
  });

  it('keeps the point while the picked street is still there and drops it when it changes', async () => {
    mockApi({ [`POST ${SUGGESTIONS_PATH}`]: { suggestions: [MADRID_SUGGESTION] } });
    const onChange = jest.fn();
    renderScreen(<AddressFieldHarness onChange={onChange} />);
    fireEvent.changeText(screen.getByLabelText('Dirección'), 'calle mayor 14');
    fireEvent.press(
      await screen.findByRole('button', { name: /Calle Mayor 14/ }, { timeout: SEARCH_TIMEOUT_MS }),
    );

    fireEvent.changeText(screen.getByLabelText('Dirección'), 'Calle Mayor 14, 3º B, Madrid');
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ latitude: 40.41644 }));

    fireEvent.changeText(screen.getByLabelText('Dirección'), 'Calle Alcalá 3');
    expect(onChange).toHaveBeenLastCalledWith({
      text: 'Calle Alcalá 3',
      latitude: null,
      longitude: null,
    });
  });

  it('does not search until there are enough letters', () => {
    mockApi({ [`POST ${SUGGESTIONS_PATH}`]: { suggestions: [] } });
    renderScreen(<AddressFieldHarness onChange={jest.fn()} />);

    fireEvent.changeText(screen.getByLabelText('Dirección'), 'ca');

    expect(findApiCall('POST', SUGGESTIONS_PATH)).toBeUndefined();
  });

  it('says so when nothing matches and lets the typed text stand', async () => {
    mockApi({ [`POST ${SUGGESTIONS_PATH}`]: { suggestions: [] } });
    renderScreen(<AddressFieldHarness onChange={jest.fn()} />);

    fireEvent.changeText(screen.getByLabelText('Dirección'), 'calle inventada 99');

    expect(
      await screen.findByText(/No encontramos esa dirección/, {}, { timeout: SEARCH_TIMEOUT_MS }),
    ).toBeOnTheScreen();
    expect(screen.getByDisplayValue('calle inventada 99')).toBeOnTheScreen();
  });

  it('tells the person to type it by hand when the provider is down', async () => {
    mockApi({
      [`POST ${SUGGESTIONS_PATH}`]: () => {
        throw buildApiError('GEOCODING_UNAVAILABLE', 502);
      },
    });
    renderScreen(<AddressFieldHarness onChange={jest.fn()} />);

    fireEvent.changeText(screen.getByLabelText('Dirección'), 'calle mayor 14');

    await waitFor(
      () => {
        expect(screen.getByText(/Escríbela a mano/)).toBeOnTheScreen();
      },
      { timeout: SEARCH_TIMEOUT_MS },
    );
  });
});
