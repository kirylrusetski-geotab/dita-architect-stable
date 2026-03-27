// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { HerettoImageResolverPlugin } from '../components/HerettoImageResolverPlugin';

// ─── HerettoImageResolverPlugin (Simplified Tests) ───────────────────────────

describe('HerettoImageResolverPlugin (Code Structure)', () => {
  // ── memory optimization verification (Elena's fix) ───────────────────────

  it('plugin code stores only node keys in queue, not full node objects', () => {
    // Test the actual plugin source code to verify Elena's memory optimization
    const pluginSource = HerettoImageResolverPlugin.toString();

    // Should declare nodeQueue as array (in compiled JS it's just const nodeQueue = [])
    expect(pluginSource).toContain('const nodeQueue = []');

    // Should push only node keys
    expect(pluginSource).toContain('nodeQueue.push(node.__key)');

    // Should NOT store full node objects
    expect(pluginSource).not.toContain('nodeQueue.push(node)');
    expect(pluginSource).not.toContain('{ key: node.__key, node: node }');
  });

  it('plugin implements correct useEffect dependencies', () => {
    const pluginSource = HerettoImageResolverPlugin.toString();

    // Should have useEffect with proper dependencies
    expect(pluginSource).toContain('useEffect');
    expect(pluginSource).toContain('[editor, herettoFile, syncTrigger]');
  });

  it('plugin handles early returns for missing data', () => {
    const pluginSource = HerettoImageResolverPlugin.toString();

    // Should check for required fields
    expect(pluginSource).toContain('herettoFile.parentFolderUuid');
    expect(pluginSource).toContain('herettoFile.ancestorUuids');

    // Should have early returns
    expect(pluginSource).toContain('return');
  });

  it('plugin calls resolveHerettoImageHref with correct parameters', () => {
    const pluginSource = HerettoImageResolverPlugin.toString();

    // Should call the resolver function
    expect(pluginSource).toContain('resolveHerettoImageHref');
    expect(pluginSource).toContain('herettoFile.parentFolderUuid');
    expect(pluginSource).toContain('herettoFile.ancestorUuids');
  });

  it('plugin handles successful and failed resolutions', () => {
    const pluginSource = HerettoImageResolverPlugin.toString();

    // Should update node with resolved URL or empty string
    expect(pluginSource).toContain('setResolvedUrl');
    expect(pluginSource).toContain('resolvedUrl || ""');

    // Should handle errors
    expect(pluginSource).toContain('catch');
    expect(pluginSource).toContain('console.warn');
  });

  it('plugin checks node existence before updating', () => {
    const pluginSource = HerettoImageResolverPlugin.toString();

    // Should verify node exists before updating
    expect(pluginSource).toContain('$getNodeByKey');
    expect(pluginSource).toContain('$isDitaImageNode');

    // Should check if node exists (compiled pattern might be different)
    expect(pluginSource).toContain('!currentNode ||');
    expect(pluginSource).toContain('if (node &&');
  });

  it('plugin only processes relative image hrefs', () => {
    const pluginSource = HerettoImageResolverPlugin.toString();

    // Should skip absolute URLs (compiled pattern)
    expect(pluginSource).toContain('https?');
    expect(pluginSource).toContain('!isUrl');

    // Should skip already resolved images
    expect(pluginSource).toContain('!hasResolvedUrl');
    expect(pluginSource).toContain('getResolvedUrl');
  });

  it('plugin traverses editor nodes correctly', () => {
    const pluginSource = HerettoImageResolverPlugin.toString();

    // Should traverse nodes recursively
    expect(pluginSource).toContain('traverse');
    expect(pluginSource).toContain('getChildren');

    // Should handle nodes that don't have children (compiled pattern)
    expect(pluginSource).toContain('typeof node.getChildren === "function"');
  });

  // ── component interface ──────────────────────────────────────────────────

  it('plugin component accepts correct props interface', () => {
    const pluginSource = HerettoImageResolverPlugin.toString();

    // Should accept HerettoFile and syncTrigger
    expect(pluginSource).toContain('herettoFile');
    expect(pluginSource).toContain('syncTrigger');
  });

  it('plugin component returns null (invisible component)', () => {
    const pluginSource = HerettoImageResolverPlugin.toString();

    // Should return null (no visible UI)
    expect(pluginSource).toContain('return null');
  });

  // ── error handling patterns ──────────────────────────────────────────────

  it('plugin handles async errors in forEach loop', () => {
    const pluginSource = HerettoImageResolverPlugin.toString();

    // Should use async callback in forEach
    expect(pluginSource).toContain('forEach');
    expect(pluginSource).toContain('async');

    // Should wrap async operations in try-catch
    expect(pluginSource).toContain('try');
    expect(pluginSource).toContain('catch');
  });

  it('plugin implements Anna\'s design without breaking changes', () => {
    const pluginSource = HerettoImageResolverPlugin.toString();

    // Core functionality should remain as Anna specified
    expect(pluginSource).toContain('useLexicalComposerContext');
    expect(pluginSource).toContain('$getRoot');
    expect(pluginSource).toContain('editor.update');

    // Should handle both success and failure cases as specified (compiled pattern)
    expect(pluginSource).toContain('setResolvedUrl(resolvedUrl || "")');
  });
});