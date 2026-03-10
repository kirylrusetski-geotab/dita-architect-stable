import type { HerettoItem } from '../types/heretto';

export const HERETTO_ROOT_UUID = '6ffb7e80-e95c-11ee-ad84-0242039bae5e';

export const herettoFolderCache = new Map<string, HerettoItem[]>();

export const RECOGNIZED_ELEMENTS = new Set([
  'title', 'shortdesc', 'prereq', 'context', 'result', 'postreq', 'p', 'cmd',
  'note', 'steps', 'ol', 'ul', 'step', 'li', 'table', 'simpletable', 'section',
  'xref', 'b', 'strong', 'i', 'em', 'ph', 'codeph', 'codeblock', 'fig', 'image',
  'term', 'uicontrol', 'wintitle', 'option', 'alt',
]);

export const STRUCTURAL_CONTAINERS = new Set([
  'task', 'concept', 'reference', 'topic', 'taskbody', 'conbody', 'refbody',
  'body', 'tgroup', 'thead', 'tbody', 'row', 'entry', 'sthead', 'strow',
  'stentry',
]);
