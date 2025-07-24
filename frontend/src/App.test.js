import { render, screen } from '@testing-library/react';
import App from './KubernetesQuiz';

test('renders kubernetes interview prep', () => {
  render(<App />);
  const linkElement = screen.getByText(/kubernetes interview prep/i);
  expect(linkElement).toBeInTheDocument();
});