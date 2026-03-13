// @vitest-environment jsdom

/**
 * Tests for the HerettoReplaceModal component implementation.
 * Verifies Jamie's three-step replace wizard correctly handles the confirm, preview, and execute workflow.
 * Tests proper state management, user interactions, API calls, and accessibility features.
 *
 * Environment: vitest + jsdom with React Testing Library
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { HerettoReplaceModal } from '../components/HerettoReplaceModal';

// Mock DiffViewer component
vi.mock('../components/DiffViewer', () => ({
  DiffViewer: ({ originalContent, modifiedContent, originalLabel, modifiedLabel }: any) => (
    <div data-testid="diff-viewer">
      <div data-testid="original-label">{originalLabel}</div>
      <div data-testid="modified-label">{modifiedLabel}</div>
      <div data-testid="original-content">{originalContent}</div>
      <div data-testid="modified-content">{modifiedContent}</div>
    </div>
  )
}));

// Mock Sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  }
}));

// Mock fetch
global.fetch = vi.fn();
const mockFetch = vi.mocked(fetch);

import { toast } from 'sonner';
const mockToast = vi.mocked(toast);

describe('HerettoReplaceModal Component', () => {
  const mockTarget = {
    uuid: 'test-uuid-123',
    name: 'test-file.dita',
    path: '/content/topics/test-file.dita',
  };

  const mockOnReplace = vi.fn();
  const mockOnClose = vi.fn();
  const editorContent = '<task id="test"><title>Test Content</title></task>';

  beforeEach(() => {
    vi.clearAllMocks();

    // Default successful fetch mock
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<task id="test"><title>Current Content</title></task>'),
    } as Response);

    mockOnReplace.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('modal visibility and structure', () => {
    it('renders nothing when closed', () => {
      render(
        <HerettoReplaceModal
          isOpen={false}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders modal when open with proper accessibility attributes', () => {
      render(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'heretto-replace-modal-title');

      const title = screen.getByText('Replace in Heretto');
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('id', 'heretto-replace-modal-title');
    });

    it('renders nothing when target is null', () => {
      render(
        <HerettoReplaceModal
          isOpen={true}
          target={null}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes modal on Escape key press', async () => {
      render(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      const modal = screen.getByRole('dialog');
      fireEvent.keyDown(modal, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('step 1: confirm target', () => {
    it('displays target file information correctly', () => {
      render(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('You are about to replace:')).toBeInTheDocument();
      expect(screen.getByText('test-file.dita')).toBeInTheDocument();
      expect(screen.getByText('/content/topics/test-file.dita')).toBeInTheDocument();
    });

    it('shows warning message about overwriting existing file', () => {
      render(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('This will overwrite the existing file in Heretto CMS.')).toBeInTheDocument();
      expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    });

    it('has autoFocus on preview changes button', () => {
      render(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      const previewButton = screen.getByRole('button', { name: 'Preview Changes' });
      expect(previewButton).toHaveAttribute('autoFocus');
    });

    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('fetches current content when preview changes is clicked', async () => {
      const user = userEvent.setup();

      render(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      const previewButton = screen.getByRole('button', { name: 'Preview Changes' });
      await user.click(previewButton);

      expect(mockFetch).toHaveBeenCalledWith('/heretto-api/all-files/test-uuid-123/content');
    });

    it('disables preview button and shows loading state while fetching', async () => {
      const user = userEvent.setup();

      // Mock a slow response
      mockFetch.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          text: () => Promise.resolve('<task><title>Current</title></task>')
        } as Response), 100))
      );

      render(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      const previewButton = screen.getByRole('button', { name: 'Preview Changes' });
      await user.click(previewButton);

      expect(previewButton).toBeDisabled();
      expect(screen.getByRole('button', { name: /Preview Changes/ })).toBeInTheDocument();
    });

    it('shows error toast when fetching current content fails', async () => {
      const user = userEvent.setup();

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      const previewButton = screen.getByRole('button', { name: 'Preview Changes' });
      await user.click(previewButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to load current content: Network error');
      });
    });

    it('shows error toast when fetch returns non-ok status', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Not found'),
      } as Response);

      render(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      const previewButton = screen.getByRole('button', { name: 'Preview Changes' });
      await user.click(previewButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to load current content: Failed to fetch current content: 404');
      });
    });
  });

  describe('step 2: preview changes', () => {
    beforeEach(async () => {
      const user = userEvent.setup();

      render(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      const previewButton = screen.getByRole('button', { name: 'Preview Changes' });
      await user.click(previewButton);

      await waitFor(() => {
        expect(screen.getByText('Replace in Heretto — Preview')).toBeInTheDocument();
      });
    });

    it('updates modal title to include preview indicator', () => {
      expect(screen.getByText('Replace in Heretto — Preview')).toBeInTheDocument();
    });

    it('displays diff viewer with correct content and labels', () => {
      expect(screen.getByTestId('diff-viewer')).toBeInTheDocument();
      expect(screen.getByTestId('original-label')).toHaveTextContent('Current in Heretto');
      expect(screen.getByTestId('modified-label')).toHaveTextContent('Your editor');
      expect(screen.getByTestId('original-content')).toHaveTextContent('<task id="test"><title>Current Content</title></task>');
      expect(screen.getByTestId('modified-content')).toHaveTextContent(editorContent);
    });

    it('has autoFocus on replace now button', () => {
      const replaceButton = screen.getByRole('button', { name: 'Replace Now' });
      expect(replaceButton).toHaveAttribute('autoFocus');
    });

    it('allows navigation back to confirm step', async () => {
      const user = userEvent.setup();

      const backButton = screen.getByRole('button', { name: 'Back' });
      await user.click(backButton);

      expect(screen.getByText('You are about to replace:')).toBeInTheDocument();
      expect(screen.queryByTestId('diff-viewer')).not.toBeInTheDocument();
    });

    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('proceeds to execute step when replace now is clicked', async () => {
      const user = userEvent.setup();

      const replaceButton = screen.getByRole('button', { name: 'Replace Now' });
      await user.click(replaceButton);

      await waitFor(() => {
        expect(screen.getByText('Uploading content...')).toBeInTheDocument();
      });
    });
  });

  describe('step 3: execute and results', () => {
    beforeEach(async () => {
      const user = userEvent.setup();

      render(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      // Navigate to preview step
      const previewButton = screen.getByRole('button', { name: 'Preview Changes' });
      await user.click(previewButton);

      await waitFor(() => {
        expect(screen.getByTestId('diff-viewer')).toBeInTheDocument();
      });

      // Navigate to execute step
      const replaceButton = screen.getByRole('button', { name: 'Replace Now' });
      await user.click(replaceButton);

      await waitFor(() => {
        expect(screen.getByText('Uploading content...')).toBeInTheDocument();
      });
    });

    it('shows progress indicators for upload and verification', () => {
      expect(screen.getByText('Uploading content...')).toBeInTheDocument();
      expect(screen.getByText('Verifying integrity...')).toBeInTheDocument();
    });

    it('calls onReplace function with target information', () => {
      expect(mockOnReplace).toHaveBeenCalledWith(mockTarget);
    });

    it('displays success state when replacement succeeds', async () => {
      await waitFor(() => {
        expect(screen.getByText('Successfully replaced')).toBeInTheDocument();
        expect(screen.getByText('test-file.dita in Heretto.')).toBeInTheDocument();
      });

      const doneButton = screen.getByRole('button', { name: 'Done' });
      expect(doneButton).toHaveAttribute('autoFocus');
    });

    it('closes modal when done button is clicked after success', async () => {
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByText('Successfully replaced')).toBeInTheDocument();
      });

      const doneButton = screen.getByRole('button', { name: 'Done' });
      await user.click(doneButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('displays error state when replacement fails', async () => {
      // Reset and set up failure scenario
      mockOnReplace.mockResolvedValueOnce({
        success: false,
        error: 'Validation failed - content mismatch'
      });

      const user = userEvent.setup();

      // Re-render to test failure scenario
      render(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      const previewButton = screen.getByRole('button', { name: 'Preview Changes' });
      await user.click(previewButton);

      await waitFor(() => {
        expect(screen.getByTestId('diff-viewer')).toBeInTheDocument();
      });

      const replaceButton = screen.getByRole('button', { name: 'Replace Now' });
      await user.click(replaceButton);

      await waitFor(() => {
        expect(screen.getByText('Replace failed')).toBeInTheDocument();
        expect(screen.getByText('Validation failed - content mismatch')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: 'Retry' });
      expect(retryButton).toHaveAttribute('autoFocus');
    });

    it('allows retry when replacement fails', async () => {
      // Reset and set up failure scenario
      mockOnReplace.mockResolvedValueOnce({
        success: false,
        error: 'Network timeout'
      });

      const user = userEvent.setup();

      // Re-render to test failure scenario
      render(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      const previewButton = screen.getByRole('button', { name: 'Preview Changes' });
      await user.click(previewButton);

      await waitFor(() => {
        expect(screen.getByTestId('diff-viewer')).toBeInTheDocument();
      });

      const replaceButton = screen.getByRole('button', { name: 'Replace Now' });
      await user.click(replaceButton);

      await waitFor(() => {
        expect(screen.getByText('Replace failed')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: 'Retry' });
      await user.click(retryButton);

      // Should return to confirm step
      expect(screen.getByText('You are about to replace:')).toBeInTheDocument();
      expect(screen.queryByText('Replace failed')).not.toBeInTheDocument();
    });

    it('allows canceling from error state', async () => {
      // Reset and set up failure scenario
      mockOnReplace.mockResolvedValueOnce({
        success: false,
        error: 'Permission denied'
      });

      const user = userEvent.setup();

      // Re-render to test failure scenario
      render(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      const previewButton = screen.getByRole('button', { name: 'Preview Changes' });
      await user.click(previewButton);

      await waitFor(() => {
        expect(screen.getByTestId('diff-viewer')).toBeInTheDocument();
      });

      const replaceButton = screen.getByRole('button', { name: 'Replace Now' });
      await user.click(replaceButton);

      await waitFor(() => {
        expect(screen.getByText('Replace failed')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('handles exceptions thrown during replacement', async () => {
      // Reset and set up exception scenario
      mockOnReplace.mockRejectedValueOnce(new Error('Network connection lost'));

      const user = userEvent.setup();

      // Re-render to test exception scenario
      render(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      const previewButton = screen.getByRole('button', { name: 'Preview Changes' });
      await user.click(previewButton);

      await waitFor(() => {
        expect(screen.getByTestId('diff-viewer')).toBeInTheDocument();
      });

      const replaceButton = screen.getByRole('button', { name: 'Replace Now' });
      await user.click(replaceButton);

      await waitFor(() => {
        expect(screen.getByText('Replace failed')).toBeInTheDocument();
        expect(screen.getByText('Network connection lost')).toBeInTheDocument();
      });
    });
  });

  describe('state reset and cleanup', () => {
    it('resets state when modal opens', () => {
      const { rerender } = render(
        <HerettoReplaceModal
          isOpen={false}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      rerender(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      // Should be at confirm step (step 1)
      expect(screen.getByText('You are about to replace:')).toBeInTheDocument();
      expect(screen.queryByTestId('diff-viewer')).not.toBeInTheDocument();
    });

    it('resets state when modal reopens after being closed', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      // Navigate to preview step
      const previewButton = screen.getByRole('button', { name: 'Preview Changes' });
      await user.click(previewButton);

      await waitFor(() => {
        expect(screen.getByTestId('diff-viewer')).toBeInTheDocument();
      });

      // Close modal
      rerender(
        <HerettoReplaceModal
          isOpen={false}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      // Reopen modal
      rerender(
        <HerettoReplaceModal
          isOpen={true}
          target={mockTarget}
          editorContent={editorContent}
          onReplace={mockOnReplace}
          onClose={mockOnClose}
        />
      );

      // Should reset to confirm step
      expect(screen.getByText('You are about to replace:')).toBeInTheDocument();
      expect(screen.queryByTestId('diff-viewer')).not.toBeInTheDocument();
    });
  });
});