import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

describe('App Component', () => {
  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderWithRouter(<App />);
  });

  it('renders navigation elements', () => {
    renderWithRouter(<App />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders main content area', () => {
    renderWithRouter(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders footer', () => {
    renderWithRouter(<App />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
}); 