// @vitest-environment jsdom

/**
 * Tests for the handleHerettoReplace function implementation in useHerettoCms hook.
 * Verifies Jamie's replace workflow correctly executes PUT/GET/verify sequence,
 * handles errors appropriately, and updates tab state according to Anna's specification.
 *
 * Environment: vitest + jsdom with React Testing Library hook testing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useHerettoCms } from '../hooks/useHerettoCms';
import type { Tab } from '../types/tab';

// Mock dependencies
vi.mock('../lib/xml-utils', () => ({
  compareXml: vi.fn(() => 'same'),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  }
}));

// Mock fetch
global.fetch = vi.fn();
const mockFetch = vi.mocked(fetch);

import { compareXml } from '../lib/xml-utils';
import { toast } from 'sonner';

const mockCompareXml = vi.mocked(compareXml);
const mockToast = vi.mocked(toast);

describe('handleHerettoReplace Function', () => {
  const createMockTab = (id: string, xmlContent?: string): Tab => ({
    id,
    xmlContent: xmlContent || '<task id="test"><title>Test Content</title></task>',
    lastUpdatedBy: 'code',
    savedXmlRef: { current: '<task id="test"><title>Original</title></task>' },
    herettoFile: null,
    herettoLastSaved: null,
    herettoRemoteChanged: false,
    herettoDirty: false,
    hasXmlErrors: false,
    xmlErrors: [],
    syncTrigger: 0,
    monacoApiRef: { current: null },
    localFileName: null,
    editMode: false,
    editModeEnterTrigger: 0,
    editModeAcceptTrigger: 0,
    editModeRejectTrigger: 0,
    snapshotRef: { current: null },
    herettoReplaceTarget: {
      uuid: 'test-uuid-123',
    },
  });

  const mockTarget = {
    uuid: 'test-uuid-123',
    name: 'test-document.dita',
    path: '/content/topics/test-document.dita',
  };

  let mockTabs: Tab[];
  let mockSetTabs: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockTabs = [createMockTab('active-tab')];
    mockSetTabs = vi.fn();

    // Default successful API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve('Success'),
      } as Response) // PUT response
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve('<task id="test"><title>Test Content</title></task>'),
      } as Response); // GET response

    mockCompareXml.mockReturnValue('same');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('successful replace workflow', () => {
    it('executes full PUT-GET-verify sequence correctly', async () => {
      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: mockTabs,
          activeTab: mockTabs[0],
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      let replaceResult: any;

      await act(async () => {
        replaceResult = await result.current.handleHerettoReplace(mockTarget);
      });

      // Verify PUT request was made
      expect(mockFetch).toHaveBeenNthCalledWith(1, '/heretto-api/all-files/test-uuid-123/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/xml' },
        body: '<task id="test"><title>Test Content</title></task>',
      });

      // Verify GET request was made for verification
      expect(mockFetch).toHaveBeenNthCalledWith(2, '/heretto-api/all-files/test-uuid-123/content');

      // Verify content comparison was performed
      expect(mockCompareXml).toHaveBeenCalledWith(
        '<task id="test"><title>Test Content</title></task>',
        '<task id="test"><title>Test Content</title></task>'
      );

      // Verify successful result
      expect(replaceResult).toEqual({ success: true });

      // Verify success toast was shown
      expect(mockToast.success).toHaveBeenCalledWith('Replaced test-document.dita in Heretto');
    });

    it('updates tab state correctly on successful replace', async () => {
      const testTab = createMockTab('active-tab');
      const testTabs = [testTab, createMockTab('other-tab')];

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: testTabs,
          activeTab: testTab,
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.handleHerettoReplace(mockTarget);
      });

      // Verify setTabs was called
      expect(mockSetTabs).toHaveBeenCalledTimes(1);

      // Get the updater function and test it
      const tabUpdater = mockSetTabs.mock.calls[0][0];
      const updatedTabs = tabUpdater(testTabs);

      // Find the updated active tab
      const updatedActiveTab = updatedTabs.find((t: Tab) => t.id === 'active-tab');
      const otherTab = updatedTabs.find((t: Tab) => t.id === 'other-tab');

      // Verify active tab was updated correctly
      expect(updatedActiveTab).toMatchObject({
        herettoReplaceTarget: null, // Cleared
        herettoFile: { uuid: 'test-uuid-123', name: 'test-document.dita', path: '/content/topics/test-document.dita' },
        herettoRemoteChanged: false,
        herettoDirty: false,
      });

      // Verify other tab was not modified
      expect(otherTab?.herettoReplaceTarget).toBeTruthy();
    });

    it('updates savedXmlRef correctly on successful replace', async () => {
      const testTab = createMockTab('active-tab');

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: [testTab],
          activeTab: testTab,
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.handleHerettoReplace(mockTarget);
      });

      // Verify savedXmlRef.current was updated
      expect(testTab.savedXmlRef.current).toBe('<task id="test"><title>Test Content</title></task>');
    });

    it('sets herettoLastSaved timestamp on successful replace', async () => {
      const beforeTime = new Date();

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: mockTabs,
          activeTab: mockTabs[0],
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.handleHerettoReplace(mockTarget);
      });

      const afterTime = new Date();

      const tabUpdater = mockSetTabs.mock.calls[0][0];
      const updatedTabs = tabUpdater(mockTabs);
      const updatedTab = updatedTabs[0];

      expect(updatedTab.herettoLastSaved).toBeInstanceOf(Date);
      expect(updatedTab.herettoLastSaved.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(updatedTab.herettoLastSaved.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('PUT request error handling', () => {
    it('returns error when PUT request fails with HTTP status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad Request'),
      } as Response);

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: mockTabs,
          activeTab: mockTabs[0],
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      let replaceResult: any;

      await act(async () => {
        replaceResult = await result.current.handleHerettoReplace(mockTarget);
      });

      expect(replaceResult).toEqual({
        success: false,
        error: 'Failed to replace file (HTTP 400) - Bad Request',
      });

      // Should not proceed to verification GET request
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockSetTabs).not.toHaveBeenCalled();
    });

    it('handles DTD validation errors specifically', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: () => Promise.resolve('DTD validation error: Element task is not allowed here'),
      } as Response);

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: mockTabs,
          activeTab: mockTabs[0],
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      let replaceResult: any;

      await act(async () => {
        replaceResult = await result.current.handleHerettoReplace(mockTarget);
      });

      expect(replaceResult.error).toContain('DTD validation error');
      expect(replaceResult.error).toContain('Element task is not allowed here');
    });

    it('handles generic error responses from Heretto API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal server error occurred'),
      } as Response);

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: mockTabs,
          activeTab: mockTabs[0],
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      let replaceResult: any;

      await act(async () => {
        replaceResult = await result.current.handleHerettoReplace(mockTarget);
      });

      expect(replaceResult).toEqual({
        success: false,
        error: 'Failed to replace file (HTTP 500) - Internal server error occurred',
      });
    });

    it('handles empty error response bodies gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve(''),
      } as Response);

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: mockTabs,
          activeTab: mockTabs[0],
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      let replaceResult: any;

      await act(async () => {
        replaceResult = await result.current.handleHerettoReplace(mockTarget);
      });

      expect(replaceResult).toEqual({
        success: false,
        error: 'Failed to replace file (HTTP 404)',
      });
    });

    it('handles response parsing errors during error handling', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.reject(new Error('Response body parsing failed')),
      } as Response);

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: mockTabs,
          activeTab: mockTabs[0],
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      let replaceResult: any;

      await act(async () => {
        replaceResult = await result.current.handleHerettoReplace(mockTarget);
      });

      expect(replaceResult).toEqual({
        success: false,
        error: 'Failed to replace file (HTTP 500)',
      });
    });
  });

  describe('verification GET request error handling', () => {
    it('returns error when verification GET request fails', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve('Success'),
        } as Response) // PUT succeeds
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        } as Response); // GET fails

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: mockTabs,
          activeTab: mockTabs[0],
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      let replaceResult: any;

      await act(async () => {
        replaceResult = await result.current.handleHerettoReplace(mockTarget);
      });

      expect(replaceResult).toEqual({
        success: false,
        error: 'Failed to verify replacement',
      });

      expect(mockSetTabs).not.toHaveBeenCalled();
    });
  });

  describe('content verification error handling', () => {
    it('returns error when compareXml detects content differences', async () => {
      mockCompareXml.mockReturnValue('different');

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: mockTabs,
          activeTab: mockTabs[0],
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      let replaceResult: any;

      await act(async () => {
        replaceResult = await result.current.handleHerettoReplace(mockTarget);
      });

      expect(replaceResult).toEqual({
        success: false,
        error: 'Verification failed - remote content differs from uploaded content',
      });

      expect(mockSetTabs).not.toHaveBeenCalled();
    });

    it('calls compareXml with correct content from upload and verification', async () => {
      const remoteContent = '<task id="test"><title>Remote Content</title></task>';

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve('Success'),
        } as Response) // PUT
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(remoteContent),
        } as Response); // GET

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: mockTabs,
          activeTab: mockTabs[0],
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.handleHerettoReplace(mockTarget);
      });

      expect(mockCompareXml).toHaveBeenCalledWith(
        '<task id="test"><title>Test Content</title></task>', // Original content
        remoteContent // Remote content from GET
      );
    });
  });

  describe('network and exception error handling', () => {
    it('handles network errors during PUT request', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: mockTabs,
          activeTab: mockTabs[0],
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      let replaceResult: any;

      await act(async () => {
        replaceResult = await result.current.handleHerettoReplace(mockTarget);
      });

      expect(replaceResult).toEqual({
        success: false,
        error: 'Network error',
      });
    });

    it('handles network errors during GET verification', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve('Success'),
        } as Response) // PUT succeeds
        .mockRejectedValueOnce(new Error('Connection timeout')); // GET fails

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: mockTabs,
          activeTab: mockTabs[0],
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      let replaceResult: any;

      await act(async () => {
        replaceResult = await result.current.handleHerettoReplace(mockTarget);
      });

      expect(replaceResult).toEqual({
        success: false,
        error: 'Connection timeout',
      });
    });

    it('handles non-Error exceptions gracefully', async () => {
      mockFetch.mockRejectedValueOnce('String error message');

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: mockTabs,
          activeTab: mockTabs[0],
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      let replaceResult: any;

      await act(async () => {
        replaceResult = await result.current.handleHerettoReplace(mockTarget);
      });

      expect(replaceResult).toEqual({
        success: false,
        error: 'String error message',
      });
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('handles empty XML content in tab', async () => {
      const emptyTab = createMockTab('empty-tab', '');

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: [emptyTab],
          activeTab: emptyTab,
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.handleHerettoReplace(mockTarget);
      });

      expect(mockFetch).toHaveBeenNthCalledWith(1, '/heretto-api/all-files/test-uuid-123/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/xml' },
        body: '',
      });
    });

    it('handles very large XML content', async () => {
      const largeContent = '<task id="test"><title>Test</title>' +
        '<body>' + 'Content '.repeat(10000) + '</body>' +
        '</task>';

      const largeTab = createMockTab('large-tab', largeContent);

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: [largeTab],
          activeTab: largeTab,
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.handleHerettoReplace(mockTarget);
      });

      expect(mockFetch).toHaveBeenNthCalledWith(1, '/heretto-api/all-files/test-uuid-123/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/xml' },
        body: largeContent,
      });
    });

    it('handles special characters and encoding in target UUID', async () => {
      const specialTarget = {
        uuid: 'test-uuid-with-special-chars-123%20',
        name: 'special file.dita',
        path: '/content/special file.dita',
      };

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: mockTabs,
          activeTab: mockTabs[0],
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.handleHerettoReplace(specialTarget);
      });

      expect(mockFetch).toHaveBeenNthCalledWith(1, '/heretto-api/all-files/test-uuid-with-special-chars-123%20/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/xml' },
        body: '<task id="test"><title>Test Content</title></task>',
      });
    });
  });

  describe('function isolation and side effects', () => {
    it('does not modify original tab objects', async () => {
      const originalTab = createMockTab('original');
      const originalTabCopy = { ...originalTab };

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: [originalTab],
          activeTab: originalTab,
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.handleHerettoReplace(mockTarget);
      });

      // Original tab should be unchanged (except savedXmlRef.current which is explicitly updated)
      expect(originalTab.herettoReplaceTarget).toEqual(originalTabCopy.herettoReplaceTarget);
      expect(originalTab.herettoFile).toEqual(originalTabCopy.herettoFile);
      expect(originalTab.herettoLastSaved).toEqual(originalTabCopy.herettoLastSaved);
    });

    it('does not call toast methods on verification failures', async () => {
      mockCompareXml.mockReturnValue('different');

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: mockTabs,
          activeTab: mockTabs[0],
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.handleHerettoReplace(mockTarget);
      });

      // Should not show success toast on verification failure
      expect(mockToast.success).not.toHaveBeenCalled();
      expect(mockToast.error).not.toHaveBeenCalled();
    });

    it('only updates the active tab in multi-tab scenarios', async () => {
      const activeTab = createMockTab('active');
      const inactiveTab1 = createMockTab('inactive1');
      const inactiveTab2 = createMockTab('inactive2');
      const allTabs = [activeTab, inactiveTab1, inactiveTab2];

      const { result } = renderHook(() =>
        useHerettoCms({
          tabs: allTabs,
          activeTab: activeTab,
          setTabs: mockSetTabs,
          setActiveTabId: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.handleHerettoReplace(mockTarget);
      });

      const tabUpdater = mockSetTabs.mock.calls[0][0];
      const updatedTabs = tabUpdater(allTabs);

      // Only active tab should be modified
      expect(updatedTabs[0].herettoReplaceTarget).toBeNull(); // active tab
      expect(updatedTabs[1].herettoReplaceTarget).toBeTruthy(); // inactive tab 1
      expect(updatedTabs[2].herettoReplaceTarget).toBeTruthy(); // inactive tab 2
    });
  });
});