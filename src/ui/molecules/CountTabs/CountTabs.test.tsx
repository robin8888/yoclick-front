import { fireEvent, render, screen } from '@testing-library/react-native';

import { ThemeProvider } from '@/shared/theme';

import { CountTabs } from './CountTabs';

const OPTIONS = [
  { value: 'clients', label: 'Alumnos', count: 12 },
  { value: 'groups', label: 'Grupos', count: 3 },
  { value: 'families', label: 'Familias', count: 0 },
] as const;

function renderTabs(onValueChange: (value: string) => void) {
  return render(
    <ThemeProvider>
      <CountTabs options={OPTIONS} selectedValue="clients" onValueChange={onValueChange} />
    </ThemeProvider>,
  );
}

describe('CountTabs', () => {
  it('says the name and the count of each tab and which one is selected', () => {
    renderTabs(jest.fn());

    expect(screen.getByRole('tab', { name: 'Alumnos: 12', selected: true })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Grupos: 3', selected: false })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Familias: 0' })).toBeOnTheScreen();
  });

  it('reports the tab that is pressed', () => {
    const onValueChange = jest.fn();
    renderTabs(onValueChange);

    fireEvent.press(screen.getByRole('tab', { name: 'Grupos: 3' }));

    expect(onValueChange).toHaveBeenCalledWith('groups');
  });
});
