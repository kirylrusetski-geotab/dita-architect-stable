// @vitest-environment jsdom

/**
 * Tests for P2-4 accessibility improvements implementation.
 * Verifies Jamie's accessibility enhancements across Heretto modals and main application:
 * - Form label associations (htmlFor/id pairing)
 * - AutoFocus on first interactive elements
 * - ARIA live regions for dynamic content
 * - Modal aria-labelledby attributes
 * - Icon button aria-label attributes
 *
 * Environment: vitest + jsdom with static analysis and component rendering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { readFileSync } from 'fs';
import path from 'path';

// Import components for rendering tests
import { HerettoStatusModal } from '../components/HerettoStatusModal';
import { HerettoBrowserModal } from '../components/HerettoBrowserModal';
import { ImportVerificationModal } from '../components/ImportVerificationModal';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  }
}));

vi.mock('../hooks/useHerettoCms', () => ({
  useHerettoCms: vi.fn(() => ({
    herettoConnected: false,
    herettoBrowsing: false,
    herettoItems: [],
    herettoBreadcrumbs: [],
    herettoSearchQuery: '',
    herettoSearchResults: [],
    herettoSearchStatus: 'idle',
    setHerettoSearchQuery: vi.fn(),
    herettoNavigate: vi.fn(),
    herettoSearch: vi.fn(),
  }))
}));

vi.mock('@lexical/react/LexicalComposer', () => ({
  LexicalComposer: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'lexical-composer' }, children)
}));

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve([])
} as Response);

describe('P2-4 Accessibility Improvements', () => {
  let herettoStatusContent: string;
  let herettoBrowserContent: string;
  let importVerificationContent: string;
  let ditaArchitectContent: string;

  beforeEach(() => {
    // Read component files for static analysis
    const herettoStatusPath = path.join(process.cwd(), 'components/HerettoStatusModal.tsx');
    const herettoBrowserPath = path.join(process.cwd(), 'components/HerettoBrowserModal.tsx');
    const importVerificationPath = path.join(process.cwd(), 'components/ImportVerificationModal.tsx');
    const ditaArchitectPath = path.join(process.cwd(), 'dita-architect.tsx');

    herettoStatusContent = readFileSync(herettoStatusPath, 'utf-8');
    herettoBrowserContent = readFileSync(herettoBrowserPath, 'utf-8');
    importVerificationContent = readFileSync(importVerificationPath, 'utf-8');
    ditaArchitectContent = readFileSync(ditaArchitectPath, 'utf-8');

    vi.clearAllMocks();
  });

  describe('HerettoStatusModal accessibility improvements', () => {
    describe('static analysis of label associations', () => {
      it('has unique IDs for email and token inputs', () => {
        expect(herettoStatusContent).toContain('id="heretto-email-input"');
        expect(herettoStatusContent).toContain('id="heretto-token-input"');
      });

      it('has htmlFor attributes pointing to input IDs', () => {
        expect(herettoStatusContent).toContain('htmlFor="heretto-email-input"');
        expect(herettoStatusContent).toContain('htmlFor="heretto-token-input"');
      });

      it('has autoFocus on the first interactive element (email input)', () => {
        const emailInputMatch = herettoStatusContent.match(/id="heretto-email-input"[^>]*autoFocus/s);
        expect(emailInputMatch).toBeTruthy();
      });

      it('maintains proper input-label relationships in source code', () => {
        // Email input and label should be properly associated
        const emailLabelMatch = herettoStatusContent.match(/htmlFor="heretto-email-input"[^>]*>[^<]*Email/s);
        expect(emailLabelMatch).toBeTruthy();

        // Token input and label should be properly associated
        const tokenLabelMatch = herettoStatusContent.match(/htmlFor="heretto-token-input"[^>]*>[^<]*API Token/s);
        expect(tokenLabelMatch).toBeTruthy();
      });
    });

    describe('rendered component accessibility validation', () => {
      const mockProps = {
        isOpen: true,
        herettoCredentials: { email: '', token: '' },
        onSave: vi.fn(),
        onClose: vi.fn(),
        onTest: vi.fn(),
        testing: false,
        testResult: null,
      };

      it('renders with proper label-input associations', () => {
        render(<HerettoStatusModal {...mockProps} />);

        const emailInput = screen.getByLabelText(/Email/i);
        const tokenInput = screen.getByLabelText(/API Token/i);

        expect(emailInput).toBeInTheDocument();
        expect(tokenInput).toBeInTheDocument();
        expect(emailInput).toHaveAttribute('id', 'heretto-email-input');
        expect(tokenInput).toHaveAttribute('id', 'heretto-token-input');
      });

      it('has autoFocus on the email input field', () => {
        render(<HerettoStatusModal {...mockProps} />);

        const emailInput = screen.getByDisplayValue('');
        expect(emailInput).toHaveAttribute('autoFocus');
      });

      it('maintains label visibility and accessibility', () => {
        render(<HerettoStatusModal {...mockProps} />);

        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText(/API Token/)).toBeInTheDocument();
      });
    });
  });

  describe('HerettoBrowserModal accessibility improvements', () => {
    describe('static analysis of ARIA attributes', () => {
      it('has aria-live="polite" on search progress region', () => {
        expect(herettoBrowserContent).toContain('aria-live="polite"');
      });

      it('has aria-label on search input that changes based on mode', () => {
        expect(herettoBrowserContent).toContain('aria-label={mode === \'replace\' ? \'Search files to replace\' : \'Search files to open\'}');
      });

      it('has autoFocus on search input (first interactive element)', () => {
        const autoFocusMatch = herettoBrowserContent.match(/autoFocus[^>]*>[^<]*placeholder=/s);
        expect(autoFocusMatch).toBeTruthy();
      });
    });

    describe('rendered component accessibility validation', () => {
      const baseProps = {
        isOpen: true,
        onClose: vi.fn(),
        onOpen: vi.fn(),
        onSave: vi.fn(),
      };

      it('renders search input with proper aria-label for open mode', () => {
        render(<HerettoBrowserModal {...baseProps} mode="open" />);

        const searchInput = screen.getByRole('searchbox');
        expect(searchInput).toHaveAttribute('aria-label', 'Search files to open');
      });

      it('renders search input with proper aria-label for replace mode', () => {
        render(<HerettoBrowserModal {...baseProps} mode="replace" />);

        const searchInput = screen.getByRole('searchbox');
        expect(searchInput).toHaveAttribute('aria-label', 'Search files to replace');
      });

      it('renders search input with proper aria-label for save mode', () => {
        render(<HerettoBrowserModal {...baseProps} mode="save" />);

        const searchInput = screen.getByRole('searchbox');
        expect(searchInput).toHaveAttribute('aria-label', 'Search files to open');
      });

      it('has autoFocus on search input', () => {
        render(<HerettoBrowserModal {...baseProps} mode="open" />);

        const searchInput = screen.getByRole('searchbox');
        expect(searchInput).toHaveAttribute('autoFocus');
      });

      it('has aria-live region for search progress updates', () => {
        render(<HerettoBrowserModal {...baseProps} mode="open" />);

        const liveRegion = document.querySelector('[aria-live="polite"]');
        expect(liveRegion).toBeInTheDocument();
      });
    });
  });

  describe('ImportVerificationModal accessibility improvements', () => {
    describe('static analysis of modal labeling', () => {
      it('has unique IDs for heading elements', () => {
        // Check for ID attributes on h3 elements (heading tags)
        const headingMatches = importVerificationContent.match(/id="[^"]*modal[^"]*"/g);
        expect(headingMatches).toBeTruthy();
        expect(headingMatches!.length).toBeGreaterThan(0);
      });

      it('has aria-labelledby pointing to heading ID', () => {
        expect(importVerificationContent).toContain('aria-labelledby={');

        // Should reference the appropriate heading ID based on verification state
        const ariaLabelledByMatch = importVerificationContent.match(/aria-labelledby=\{[^}]*\}/);
        expect(ariaLabelledByMatch).toBeTruthy();
      });

      it('has conditional autoFocus based on verification result', () => {
        const autoFocusMatch = importVerificationContent.match(/autoFocus[^>]*>/);
        expect(autoFocusMatch).toBeTruthy();
      });
    });

    describe('rendered component accessibility validation', () => {
      const baseProps = {
        isOpen: true,
        onClose: vi.fn(),
        onContinue: vi.fn(),
      };

      it('renders with proper aria-labelledby for success state', () => {
        render(
          <ImportVerificationModal
            {...baseProps}
            verification={{
              status: 'success',
              message: 'Import successful',
              details: null,
            }}
          />
        );

        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-labelledby');

        const labelId = dialog.getAttribute('aria-labelledby');
        const labelElement = document.getElementById(labelId!);
        expect(labelElement).toBeInTheDocument();
      });

      it('renders with proper aria-labelledby for error state', () => {
        render(
          <ImportVerificationModal
            {...baseProps}
            verification={{
              status: 'error',
              message: 'Import failed',
              details: { issues: [] },
            }}
          />
        );

        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-labelledby');
      });

      it('has autoFocus on the primary action button', () => {
        render(
          <ImportVerificationModal
            {...baseProps}
            verification={{
              status: 'success',
              message: 'Import successful',
              details: null,
            }}
          />
        );

        const primaryButton = screen.getByRole('button');
        expect(primaryButton).toHaveAttribute('autoFocus');
      });

      it('maintains modal accessibility structure', () => {
        render(
          <ImportVerificationModal
            {...baseProps}
            verification={{
              status: 'success',
              message: 'Import successful',
              details: null,
            }}
          />
        );

        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('role', 'dialog');
      });
    });
  });

  describe('dita-architect.tsx toolbar button accessibility', () => {
    describe('static analysis of ARIA labels', () => {
      it('has aria-label on Heretto Refresh button', () => {
        expect(ditaArchitectContent).toContain('aria-label="Refresh content from Heretto"');
      });

      it('has aria-label on Heretto Disconnect button', () => {
        expect(ditaArchitectContent).toContain('aria-label="Disconnect from Heretto CMS"');
      });

      it('maintains existing Heretto toolbar button structure', () => {
        // Should have refresh and disconnect buttons in Heretto context toolbar
        expect(ditaArchitectContent).toContain('handleHerettoRefresh');
        expect(ditaArchitectContent).toContain('handleHerettoDisconnect');
      });
    });

    it('preserves existing Heretto integration functionality', () => {
      // Verify that accessibility improvements don't break existing features
      expect(ditaArchitectContent).toContain('herettoConnected');
      expect(ditaArchitectContent).toContain('HerettoBrowserModal');
      expect(ditaArchitectContent).toContain('HerettoReplaceBar');
      expect(ditaArchitectContent).toContain('HerettoReplaceModal');
    });
  });

  describe('toast message accessibility (P2-14)', () => {
    describe('useExternalLoad toast copy validation', () => {
      it('uses simplified "Imported" language instead of developer-centric copy', () => {
        // This is validated through static analysis of the external load tests
        // and the useExternalLoad implementation which should show "Imported ${fileName}"
        const externalLoadTestPath = path.join(process.cwd(), 'tests/use-external-load-simple.test.ts');
        const externalLoadTestContent = readFileSync(externalLoadTestPath, 'utf-8');

        expect(externalLoadTestContent).toContain('Imported test-task.dita');
        expect(externalLoadTestContent).toContain('Imported my-concept.dita');
        expect(externalLoadTestContent).toContain('Imported valid.dita');
      });
    });
  });

  describe('comprehensive accessibility compliance', () => {
    it('ensures all interactive elements have proper accessibility attributes', () => {
      // HerettoStatusModal
      expect(herettoStatusContent).toContain('autoFocus');
      expect(herettoStatusContent).toContain('htmlFor=');
      expect(herettoStatusContent).toContain('id=');

      // HerettoBrowserModal
      expect(herettoBrowserContent).toContain('aria-live=');
      expect(herettoBrowserContent).toContain('aria-label=');
      expect(herettoBrowserContent).toContain('autoFocus');

      // ImportVerificationModal
      expect(importVerificationContent).toContain('aria-labelledby=');
      expect(importVerificationContent).toContain('autoFocus');

      // Main application
      expect(ditaArchitectContent).toContain('aria-label=');
    });

    it('follows WCAG guidelines for focus management', () => {
      // Each modal should have autoFocus on the first interactive element
      expect(herettoStatusContent).toContain('autoFocus');
      expect(herettoBrowserContent).toContain('autoFocus');
      expect(importVerificationContent).toContain('autoFocus');
    });

    it('provides proper labeling for screen readers', () => {
      // Form controls should have associated labels
      expect(herettoStatusContent).toContain('htmlFor="heretto-email-input"');
      expect(herettoStatusContent).toContain('htmlFor="heretto-token-input"');

      // Search input should have descriptive aria-label
      expect(herettoBrowserContent).toContain('Search files to replace');
      expect(herettoBrowserContent).toContain('Search files to open');

      // Icon buttons should have aria-labels
      expect(ditaArchitectContent).toContain('Refresh content from Heretto');
      expect(ditaArchitectContent).toContain('Disconnect from Heretto CMS');
    });

    it('provides live region updates for dynamic content', () => {
      // Search progress should be announced to screen readers
      expect(herettoBrowserContent).toContain('aria-live="polite"');
    });

    it('maintains modal accessibility structure', () => {
      // All modals should have proper dialog labeling
      expect(herettoStatusContent).toContain('role="dialog"');
      expect(herettoBrowserContent).toContain('role="dialog"');
      expect(importVerificationContent).toContain('role="dialog"');

      expect(herettoStatusContent).toContain('aria-modal="true"');
      expect(herettoBrowserContent).toContain('aria-modal="true"');
      expect(importVerificationContent).toContain('aria-modal="true"');
    });

    it('preserves existing functionality while adding accessibility features', () => {
      // Verify that accessibility improvements are additive and don't break existing features
      expect(herettoStatusContent).toContain('onSave');
      expect(herettoStatusContent).toContain('onTest');
      expect(herettoBrowserContent).toContain('onOpen');
      expect(herettoBrowserContent).toContain('onClose');
      expect(importVerificationContent).toContain('onContinue');
    });
  });

  describe('regression prevention for accessibility fixes', () => {
    it('ensures accessibility attributes are not accidentally removed', () => {
      // These attributes should be present and properly implemented
      const requiredAccessibilityFeatures = [
        'aria-labelledby',
        'aria-live="polite"',
        'aria-label=',
        'htmlFor=',
        'autoFocus',
        'role="dialog"',
        'aria-modal="true"'
      ];

      const allContent = herettoStatusContent + herettoBrowserContent +
                        importVerificationContent + ditaArchitectContent;

      requiredAccessibilityFeatures.forEach(feature => {
        expect(allContent).toContain(feature);
      });
    });

    it('maintains consistent accessibility patterns across modals', () => {
      // All modals should have consistent structure
      [herettoStatusContent, herettoBrowserContent, importVerificationContent].forEach(content => {
        expect(content).toContain('role="dialog"');
        expect(content).toContain('aria-modal="true"');
      });
    });
  });
});