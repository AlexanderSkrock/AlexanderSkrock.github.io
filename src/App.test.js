import React from 'react';
import { MemoryRouter } from 'react-router-dom'

import { render, screen } from '@testing-library/react';

import App from './App';

const renderRoute = (path) => {
  const entries = path ? [ path ] : undefined;
  render(
    <MemoryRouter initialEntries={ entries }>
      <App />
    </MemoryRouter>
  );
}

test('renders under construction info for root page without slash', () => {
  renderRoute();

  const grid = screen.getByTestId("entryPage");
  expect(grid).toBeInTheDocument();
});

test('renders under construction info for root page with slash', () => {
  renderRoute("/")

  const grid = screen.getByTestId("entryPage");
  expect(grid).toBeInTheDocument();
});

test('renders experiences info for professional experience page', () => {
  renderRoute("/professional");

  const grid = screen.getByTestId("professionalExperiencesPage");
  expect(grid).toBeInTheDocument();
});


test('renders oss contributions for oss page', () => {
  renderRoute("/oss");

  const grid = screen.getByTestId("ossPage");
  expect(grid).toBeInTheDocument();
});

test('renders contact info for contact page', () => {
  renderRoute("/contact");

  const grid = screen.getByTestId("contactPage");
  expect(grid).toBeInTheDocument();
});

test('renders under construction info for unknown page', () => {
  renderRoute("/__UNKNOWN__");
  const elements = screen.getAllByAltText(/maintenance/i);
  expect(elements).toHaveLength(1);
  expect(elements[0]).toBeInTheDocument();
});
