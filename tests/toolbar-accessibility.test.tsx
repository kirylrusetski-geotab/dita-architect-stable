/**
 * Tests for Toolbar accessibility enhancements - aria-label for theme selector button
 * and tooltips for theme options. Validates Jamie's implementation of Anna's accessibility plan.
 *
 * Environment: vitest + jsdom + React Testing Library
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { Toolbar, THEME_OPTIONS, THEME_DESCRIPTIONS, ThemeName } from '../components/Toolbar';

// Mock Lexical editor configuration for tests
const initialConfig = {
  namespace: 'TestEditor',
  theme: {},
  onError: () => {},
  nodes: [],
};

// Wrapper component to provide Lexical context for Toolbar
function TestToolbar({ currentTheme, onThemeChange, ...props }: Parameters<typeof Toolbar>[0]) {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <Toolbar currentTheme={currentTheme} onThemeChange={onThemeChange} {...props} />
    </LexicalComposer>
  );
}

describe('Toolbar Theme Selector Accessibility', () => {

  describe('aria-label for screen reader announcement', () => {
    it('announces "Select theme: Dark" when dark theme is active', () => {
      const mockOnThemeChange = vi.fn();
      render(<TestToolbar currentTheme="dark" onThemeChange={mockOnThemeChange} />);

      const themeButton = screen.getByRole('button', { name: /select theme/i });
      expect(themeButton).toHaveAttribute('aria-label', 'Select theme: Dark');
    });

    it('announces "Select theme: Light" when light theme is active', () => {
      const mockOnThemeChange = vi.fn();
      render(<TestToolbar currentTheme="light" onThemeChange={mockOnThemeChange} />);

      const themeButton = screen.getByRole('button', { name: /select theme/i });
      expect(themeButton).toHaveAttribute('aria-label', 'Select theme: Light');
    });

    it('announces "Select theme: Claude" when claude theme is active', () => {
      const mockOnThemeChange = vi.fn();
      render(<TestToolbar currentTheme="claude" onThemeChange={mockOnThemeChange} />);

      const themeButton = screen.getByRole('button', { name: /select theme/i });
      expect(themeButton).toHaveAttribute('aria-label', 'Select theme: Claude');
    });

    it('announces "Select theme: Geotab" when geotab theme is active', () => {
      const mockOnThemeChange = vi.fn();
      render(<TestToolbar currentTheme="geotab" onThemeChange={mockOnThemeChange} />);

      const themeButton = screen.getByRole('button', { name: /select theme/i });
      expect(themeButton).toHaveAttribute('aria-label', 'Select theme: Geotab');
    });

    it('updates aria-label when theme changes', () => {
      const mockOnThemeChange = vi.fn();
      const { rerender } = render(<TestToolbar currentTheme="dark" onThemeChange={mockOnThemeChange} />);

      let themeButton = screen.getByRole('button', { name: /select theme/i });
      expect(themeButton).toHaveAttribute('aria-label', 'Select theme: Dark');

      rerender(<TestToolbar currentTheme="nord" onThemeChange={mockOnThemeChange} />);
      themeButton = screen.getByRole('button', { name: /select theme/i });
      expect(themeButton).toHaveAttribute('aria-label', 'Select theme: Nord');
    });
  });

  describe('theme option tooltips for context', () => {
    it('opens dropdown when theme selector is clicked', () => {
      const mockOnThemeChange = vi.fn();
      render(<TestToolbar currentTheme="dark" onThemeChange={mockOnThemeChange} />);

      const themeButton = screen.getByRole('button', { name: /select theme/i });
      fireEvent.click(themeButton);

      // Menu should be visible with all theme options
      expect(screen.getByRole('menu')).toBeInTheDocument();
      // Check that each menu item exists
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(THEME_OPTIONS.length);
    });

    it('all theme options are wrapped in tooltips with correct descriptions', () => {
      const mockOnThemeChange = vi.fn();
      render(<TestToolbar currentTheme="dark" onThemeChange={mockOnThemeChange} />);

      // Open dropdown
      const themeButton = screen.getByRole('button', { name: /select theme/i });
      fireEvent.click(themeButton);

      // Check that each theme option exists as menu item
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(THEME_OPTIONS.length);

      // Check that each theme has a corresponding description in the DOM (as tooltip content)
      THEME_OPTIONS.forEach(theme => {
        const expectedDescription = THEME_DESCRIPTIONS[theme.value];
        expect(expectedDescription).toBeDefined();
        expect(typeof expectedDescription).toBe('string');
        expect(expectedDescription.length).toBeGreaterThan(0);

        // The tooltip description should be in the DOM (even if hidden)
        expect(screen.getByText(expectedDescription)).toBeInTheDocument();
      });
    });

    it('tooltip descriptions match Anna\'s specifications for all themes', () => {
      // Verify the specific descriptions Jamie implemented match Anna's plan
      expect(THEME_DESCRIPTIONS.dark).toBe('Standard dark theme');
      expect(THEME_DESCRIPTIONS.light).toBe('Standard light theme');
      expect(THEME_DESCRIPTIONS.claude).toBe('Claude.ai interface theme');
      expect(THEME_DESCRIPTIONS.nord).toBe('Developer-focused colors');
      expect(THEME_DESCRIPTIONS.solarized).toBe('Developer color scheme');
      expect(THEME_DESCRIPTIONS.geotab).toBe('Geotab corporate theme');
    });

    it('all descriptions are under 30 characters as specified in Anna\'s plan', () => {
      Object.values(THEME_DESCRIPTIONS).forEach((description, index) => {
        const themeName = Object.keys(THEME_DESCRIPTIONS)[index];
        expect(description.length).toBeLessThanOrEqual(30,
          `${themeName} description "${description}" exceeds 30 character limit`);
      });
    });
  });

  describe('preserved functionality after accessibility enhancement', () => {
    it('theme selection still works - clicking theme option calls onThemeChange', () => {
      const mockOnThemeChange = vi.fn();
      render(<TestToolbar currentTheme="dark" onThemeChange={mockOnThemeChange} />);

      // Open dropdown
      const themeButton = screen.getByRole('button', { name: /select theme/i });
      fireEvent.click(themeButton);

      // Click light theme
      const lightTheme = screen.getByRole('menuitem', { name: 'Light' });
      fireEvent.click(lightTheme);

      expect(mockOnThemeChange).toHaveBeenCalledWith('light');
    });

    it('current theme shows checkmark indicator', () => {
      const mockOnThemeChange = vi.fn();
      render(<TestToolbar currentTheme="claude" onThemeChange={mockOnThemeChange} />);

      // Open dropdown
      const themeButton = screen.getByRole('button', { name: /select theme/i });
      fireEvent.click(themeButton);

      // Get all menu items and find the one containing "Claude" text
      const menuItems = screen.getAllByRole('menuitem');
      const claudeTheme = menuItems.find(item => item.textContent?.includes('Claude'));
      const darkTheme = menuItems.find(item => item.textContent?.includes('Dark'));

      expect(claudeTheme).toBeDefined();
      expect(darkTheme).toBeDefined();

      // Claude theme should have checkmark (✓ character)
      expect(claudeTheme!.textContent).toContain('✓');
      // Dark theme should not have checkmark
      expect(darkTheme!.textContent).not.toContain('✓');
    });

    it('dropdown closes when theme option is selected', () => {
      const mockOnThemeChange = vi.fn();
      render(<TestToolbar currentTheme="dark" onThemeChange={mockOnThemeChange} />);

      // Open dropdown
      const themeButton = screen.getByRole('button', { name: /select theme/i });
      fireEvent.click(themeButton);
      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Select a theme
      const lightTheme = screen.getByRole('menuitem', { name: 'Light' });
      fireEvent.click(lightTheme);

      // Menu should be gone
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('keyboard navigation works with Arrow Down to open dropdown', () => {
      const mockOnThemeChange = vi.fn();
      render(<TestToolbar currentTheme="dark" onThemeChange={mockOnThemeChange} />);

      const themeButton = screen.getByRole('button', { name: /select theme/i });
      fireEvent.keyDown(themeButton, { key: 'ArrowDown' });

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('keyboard navigation works within opened menu with Arrow keys', () => {
      const mockOnThemeChange = vi.fn();
      render(<TestToolbar currentTheme="dark" onThemeChange={mockOnThemeChange} />);

      // Open menu
      const themeButton = screen.getByRole('button', { name: /select theme/i });
      fireEvent.keyDown(themeButton, { key: 'ArrowDown' });

      const menu = screen.getByRole('menu');

      // Test arrow navigation
      fireEvent.keyDown(menu, { key: 'ArrowDown' });
      fireEvent.keyDown(menu, { key: 'ArrowUp' });

      // Menu should still be open
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('Escape key closes the dropdown menu', () => {
      const mockOnThemeChange = vi.fn();
      render(<TestToolbar currentTheme="dark" onThemeChange={mockOnThemeChange} />);

      // Open menu
      const themeButton = screen.getByRole('button', { name: /select theme/i });
      fireEvent.click(themeButton);
      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Press Escape
      const menu = screen.getByRole('menu');
      fireEvent.keyDown(menu, { key: 'Escape' });

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('ARIA attributes for dropdown behavior', () => {
    it('theme selector has proper ARIA dropdown attributes', () => {
      const mockOnThemeChange = vi.fn();
      render(<TestToolbar currentTheme="dark" onThemeChange={mockOnThemeChange} />);

      const themeButton = screen.getByRole('button', { name: /select theme/i });
      expect(themeButton).toHaveAttribute('aria-haspopup', 'true');
      expect(themeButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('aria-expanded changes when dropdown is opened', () => {
      const mockOnThemeChange = vi.fn();
      render(<TestToolbar currentTheme="dark" onThemeChange={mockOnThemeChange} />);

      const themeButton = screen.getByRole('button', { name: /select theme/i });
      expect(themeButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(themeButton);
      expect(themeButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('dropdown menu has role="menu" and menu items have role="menuitem"', () => {
      const mockOnThemeChange = vi.fn();
      render(<TestToolbar currentTheme="dark" onThemeChange={mockOnThemeChange} />);

      // Open dropdown
      const themeButton = screen.getByRole('button', { name: /select theme/i });
      fireEvent.click(themeButton);

      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();

      // All theme options should be menu items
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(THEME_OPTIONS.length);
    });
  });
});

describe('THEME_DESCRIPTIONS constant validation', () => {
  it('has descriptions for all themes in THEME_OPTIONS', () => {
    THEME_OPTIONS.forEach(theme => {
      expect(THEME_DESCRIPTIONS).toHaveProperty(theme.value);
      expect(THEME_DESCRIPTIONS[theme.value]).toBeTruthy();
    });
  });

  it('has no extra descriptions beyond THEME_OPTIONS', () => {
    const themeValues = THEME_OPTIONS.map(theme => theme.value).sort();
    const descriptionKeys = Object.keys(THEME_DESCRIPTIONS).sort();
    expect(descriptionKeys).toEqual(themeValues);
  });

  it('all descriptions are strings with meaningful content', () => {
    Object.entries(THEME_DESCRIPTIONS).forEach(([theme, description]) => {
      expect(typeof description).toBe('string');
      expect(description.trim()).toBeTruthy();
      expect(description.length).toBeGreaterThan(5);
      expect(description.length).toBeLessThanOrEqual(30);
    });
  });
});