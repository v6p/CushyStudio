import type * as T from 'monaco-editor/esm/vs/editor/editor.api'

export type TypescriptOptions = T.languages.typescript.CompilerOptions
export type ITextModel = ReturnType<typeof T.editor.createModel>
export type IStandaloneCodeEditor = import('monaco-editor').editor.IStandaloneCodeEditor
export type Monaco = typeof T
