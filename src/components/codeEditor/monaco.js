import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution';
import 'monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution';
import 'monaco-editor/esm/vs/basic-languages/java/java.contribution';
import 'monaco-editor/esm/vs/basic-languages/go/go.contribution';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
globalThis.MonacoEnvironment = { getWorker: () => new EditorWorker() };
loader.config({ monaco });
