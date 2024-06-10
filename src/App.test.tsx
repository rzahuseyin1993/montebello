import { render } from '@testing-library/react';
import App from './App';

test('renders app', () => {
  render(<App />);
  const appElement = document.getElementById('montebello');
  expect(appElement).toBeInTheDocument();
});
