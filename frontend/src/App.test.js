import { render, screen } from '@testing-library/react';
import App from './App';

test('renders kubernetes interview prep', () => {
  render(<App />);
  const linkElement = screen.getByText(/start practicing/i);
  expect(linkElement).toBeInTheDocument();
});