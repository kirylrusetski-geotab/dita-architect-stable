// @vitest-environment jsdom

/**
 * Tests for the HerettoReplaceBar component implementation.
 * Verifies Jamie's persistent context bar correctly displays replace target information
 * and provides proper user interaction buttons for the replace workflow.
 *
 * Environment: vitest + jsdom with React Testing Library
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { HerettoReplaceBar } from '../components/HerettoReplaceBar';

describe('HerettoReplaceBar Component', () => {
  const mockOnPreviewDiff = vi.fn();
  const mockOnReplace = vi.fn();
  const mockOnDismiss = vi.fn();

  const defaultProps = {
    targetName: 'test-document.dita',
    onPreviewDiff: mockOnPreviewDiff,
    onReplace: mockOnReplace,
    onDismiss: mockOnDismiss,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('component rendering and structure', () => {
    it('renders replace bar with correct layout and styling', () => {
      const { container } = render(<HerettoReplaceBar {...defaultProps} />);

      const bar = container.firstChild as HTMLElement;
      expect(bar).toHaveClass('absolute', 'top-10', 'left-0', 'right-0', 'h-9');
      expect(bar).toHaveClass('flex', 'items-center', 'justify-between', 'px-4', 'z-10');
    });

    it('displays Heretto logo with correct styling', () => {
      render(<HerettoReplaceBar {...defaultProps} />);

      // The HerettoLogo is an SVG element with specific structure
      const logo = document.querySelector('svg');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('viewBox', '0 0 24 24');
      expect(logo?.querySelector('text')).toHaveTextContent('H');
    });

    it('displays replace target information correctly', () => {
      render(<HerettoReplaceBar {...defaultProps} />);

      expect(screen.getByText('Replace target:')).toBeInTheDocument();
      expect(screen.getByText('test-document.dita')).toBeInTheDocument();
    });

    it('shows full target name in title attribute for truncated display', () => {
      render(<HerettoReplaceBar {...defaultProps} />);

      const targetElement = screen.getByText('test-document.dita');
      expect(targetElement).toHaveAttribute('title', 'test-document.dita');
      expect(targetElement).toHaveClass('truncate', 'font-medium');
    });

    it('handles long file names with proper truncation', () => {
      const longFileName = 'very-long-document-name-that-should-be-truncated-in-the-ui.dita';

      render(
        <HerettoReplaceBar
          {...defaultProps}
          targetName={longFileName}
        />
      );

      const targetElement = screen.getByText(longFileName);
      expect(targetElement).toHaveAttribute('title', longFileName);
      expect(targetElement).toHaveClass('truncate');
    });
  });

  describe('action buttons', () => {
    it('renders all three action buttons with correct text and icons', () => {
      render(<HerettoReplaceBar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Preview Diff/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Replace in Heretto/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '' })).toBeInTheDocument(); // Dismiss button has no text, just icon
    });

    it('preview diff button has correct styling and tooltip', () => {
      render(<HerettoReplaceBar {...defaultProps} />);

      const previewButton = screen.getByRole('button', { name: /Preview Diff/ });
      expect(previewButton).toHaveAttribute('title', 'Preview the diff between current content and your editor');
      expect(previewButton).toHaveClass('flex', 'items-center', 'gap-1.5', 'px-2.5', 'py-1', 'rounded', 'text-xs', 'font-medium');
    });

    it('replace button has correct styling and tooltip', () => {
      render(<HerettoReplaceBar {...defaultProps} />);

      const replaceButton = screen.getByRole('button', { name: /Replace in Heretto/ });
      expect(replaceButton).toHaveAttribute('title', 'Replace the existing file in Heretto with your editor content');
      expect(replaceButton).toHaveClass('flex', 'items-center', 'gap-1.5', 'px-2.5', 'py-1', 'rounded', 'text-xs', 'font-medium');
    });

    it('dismiss button has correct styling and tooltip', () => {
      render(<HerettoReplaceBar {...defaultProps} />);

      // Find dismiss button by its X icon (it's the last button)
      const buttons = screen.getAllByRole('button');
      const dismissButton = buttons[buttons.length - 1];

      expect(dismissButton).toHaveAttribute('title', 'Dismiss replace target');
      expect(dismissButton).toHaveClass('p-1', 'rounded', 'transition-colors', 'hover-text');
    });
  });

  describe('user interactions', () => {
    it('calls onPreviewDiff when preview diff button is clicked', async () => {
      const user = userEvent.setup();

      render(<HerettoReplaceBar {...defaultProps} />);

      const previewButton = screen.getByRole('button', { name: /Preview Diff/ });
      await user.click(previewButton);

      expect(mockOnPreviewDiff).toHaveBeenCalledTimes(1);
    });

    it('calls onReplace when replace button is clicked', async () => {
      const user = userEvent.setup();

      render(<HerettoReplaceBar {...defaultProps} />);

      const replaceButton = screen.getByRole('button', { name: /Replace in Heretto/ });
      await user.click(replaceButton);

      expect(mockOnReplace).toHaveBeenCalledTimes(1);
    });

    it('calls onDismiss when dismiss button is clicked', async () => {
      const user = userEvent.setup();

      render(<HerettoReplaceBar {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const dismissButton = buttons[buttons.length - 1];
      await user.click(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('handles multiple rapid clicks without issues', async () => {
      const user = userEvent.setup();

      render(<HerettoReplaceBar {...defaultProps} />);

      const previewButton = screen.getByRole('button', { name: /Preview Diff/ });

      await user.click(previewButton);
      await user.click(previewButton);
      await user.click(previewButton);

      expect(mockOnPreviewDiff).toHaveBeenCalledTimes(3);
    });
  });

  describe('hover effects and interactive states', () => {
    it('applies hover styles to preview diff button', () => {
      render(<HerettoReplaceBar {...defaultProps} />);

      const previewButton = screen.getByRole('button', { name: /Preview Diff/ });

      // Trigger mouseenter event
      fireEvent.mouseEnter(previewButton);

      // Check that hover styles are applied via inline styles
      expect(previewButton.style.backgroundColor).toBe('var(--app-surface-hover)');
      expect(previewButton.style.color).toBe('var(--app-text-primary)');

      // Trigger mouseleave event
      fireEvent.mouseLeave(previewButton);

      // Check that styles are reset
      expect(previewButton.style.backgroundColor).toBe('var(--app-surface-raised)');
      expect(previewButton.style.color).toBe('var(--app-text-secondary)');
    });

    it('applies hover styles to replace button', () => {
      render(<HerettoReplaceBar {...defaultProps} />);

      const replaceButton = screen.getByRole('button', { name: /Replace in Heretto/ });

      // Trigger mouseenter event
      fireEvent.mouseEnter(replaceButton);

      // Check that hover color is applied
      expect(replaceButton.style.backgroundColor).toBe('#d97706');

      // Trigger mouseleave event
      fireEvent.mouseLeave(replaceButton);

      // Check that color is reset
      expect(replaceButton.style.backgroundColor).toBe('#f59e0b');
    });

    it('maintains accessible focus indicators for all buttons', () => {
      render(<HerettoReplaceBar {...defaultProps} />);

      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {
        button.focus();
        expect(document.activeElement).toBe(button);
      });
    });
  });

  describe('responsive layout and positioning', () => {
    it('uses flexbox layout with proper spacing and alignment', () => {
      const { container } = render(<HerettoReplaceBar {...defaultProps} />);

      const bar = container.firstChild as HTMLElement;
      expect(bar).toHaveClass('flex', 'items-center', 'justify-between');

      const leftSection = bar.querySelector('.flex.items-center.gap-2.text-xs.min-w-0');
      const rightSection = bar.querySelector('.flex.items-center.gap-2.shrink-0');

      expect(leftSection).toBeInTheDocument();
      expect(rightSection).toBeInTheDocument();
    });

    it('handles content overflow with proper truncation', () => {
      const { container } = render(<HerettoReplaceBar {...defaultProps} />);

      const leftSection = container.querySelector('.min-w-0');
      expect(leftSection).toBeInTheDocument();

      const targetNameElement = container.querySelector('.truncate');
      expect(targetNameElement).toBeInTheDocument();
    });

    it('maintains shrink-0 on action buttons to prevent collapsing', () => {
      const { container } = render(<HerettoReplaceBar {...defaultProps} />);

      const rightSection = container.querySelector('.shrink-0');
      expect(rightSection).toBeInTheDocument();
      expect(rightSection?.children).toHaveLength(3); // Three buttons
    });
  });

  describe('color scheme and theming', () => {
    it('uses proper CSS custom properties for theming', () => {
      const { container } = render(<HerettoReplaceBar {...defaultProps} />);

      const bar = container.firstChild as HTMLElement;

      // Check that CSS custom properties are used in inline styles
      const backgroundStyle = bar.style.backgroundColor;
      const borderStyle = bar.style.borderBottom;

      expect(backgroundStyle).toContain('color-mix');
      expect(backgroundStyle).toContain('#f59e0b');
      expect(backgroundStyle).toContain('var(--app-surface)');

      expect(borderStyle).toContain('color-mix');
      expect(borderStyle).toContain('#f59e0b');
      expect(borderStyle).toContain('var(--app-border)');
    });

    it('applies warning color scheme consistently', () => {
      render(<HerettoReplaceBar {...defaultProps} />);

      // Check Heretto logo color
      const logo = document.querySelector('svg');
      expect(logo).toHaveStyle({ color: '#f59e0b' });

      // Check replace button color
      const replaceButton = screen.getByRole('button', { name: /Replace in Heretto/ });
      expect(replaceButton).toHaveStyle({ backgroundColor: '#f59e0b' });
    });

    it('maintains text color hierarchy with CSS variables', () => {
      render(<HerettoReplaceBar {...defaultProps} />);

      const mutedText = screen.getByText('Replace target:');
      expect(mutedText).toHaveStyle({ color: 'var(--app-text-muted)' });

      const primaryText = screen.getByText('test-document.dita');
      expect(primaryText).toHaveStyle({ color: 'var(--app-text-primary)' });
    });
  });

  describe('accessibility compliance', () => {
    it('provides meaningful button labels and tooltips', () => {
      render(<HerettoReplaceBar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Preview Diff/ })).toHaveAttribute('title');
      expect(screen.getByRole('button', { name: /Replace in Heretto/ })).toHaveAttribute('title');

      const buttons = screen.getAllByRole('button');
      const dismissButton = buttons[buttons.length - 1];
      expect(dismissButton).toHaveAttribute('title', 'Dismiss replace target');
    });

    it('maintains keyboard navigation support', () => {
      render(<HerettoReplaceBar {...defaultProps} />);

      const buttons = screen.getAllByRole('button');

      // All buttons should be focusable
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('disabled');
        expect(button.tabIndex).not.toBe(-1);
      });
    });

    it('uses semantic HTML elements and proper ARIA attributes', () => {
      render(<HerettoReplaceBar {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);

      // Each button should have proper button role
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('integration context', () => {
    it('renders within expected z-index context for overlay positioning', () => {
      const { container } = render(<HerettoReplaceBar {...defaultProps} />);

      const bar = container.firstChild as HTMLElement;
      expect(bar).toHaveClass('z-10');
    });

    it('positions correctly relative to editor viewport', () => {
      const { container } = render(<HerettoReplaceBar {...defaultProps} />);

      const bar = container.firstChild as HTMLElement;
      expect(bar).toHaveClass('absolute', 'top-10', 'left-0', 'right-0');
      expect(bar).toHaveClass('h-9'); // Fixed height for consistent layout
    });

    it('adapts to different target name lengths gracefully', () => {
      const testCases = [
        'short.dita',
        'medium-length-document-name.dita',
        'very-very-very-long-document-name-that-could-overflow-the-container-width.dita'
      ];

      testCases.forEach(targetName => {
        const { unmount } = render(
          <HerettoReplaceBar
            {...defaultProps}
            targetName={targetName}
          />
        );

        expect(screen.getByText(targetName)).toBeInTheDocument();
        expect(screen.getByText(targetName)).toHaveAttribute('title', targetName);

        unmount();
      });
    });
  });
});