export interface LSPServer {
  id: string
  name: string
  languageId: string
  path?: string
  status: "running" | "stopped" | "error"
  capabilities?: Record<string, unknown>
}

export interface LSPPosition {
  line: number
  character: number
}

export interface LSPRange {
  start: LSPPosition
  end: LSPPosition
}

export interface LSPDocumentSymbol {
  name: string
  kind: number
  location: {
    uri: string
    range: LSPRange
  }
  children?: LSPDocumentSymbol[]
}

export interface LSPHoverResult {
  contents: string | { language: string; value: string }
  range?: LSPRange
}

export interface LSPDiagnostic {
  severity: number
  message: string
  range: LSPRange
  source?: string
  code?: string | number
}

export const LSP_SYMBOL_KINDS = {
  file: 1,
  module: 2,
  namespace: 3,
  package: 4,
  class: 5,
  method: 6,
  property: 7,
  field: 8,
  constructor: 9,
  enum: 10,
  interface: 11,
  function: 12,
  variable: 13,
  constant: 14,
  string: 15,
  number: 16,
  boolean: 17,
  array: 18,
  object: 19,
  key: 20,
  null: 21,
  enumMember: 22,
  struct: 23,
  event: 24,
  operator: 25,
  typeParameter: 26,
}

export const LSP_DIAGNOSTIC_SEVERITIES = {
  error: 1,
  warning: 2,
  information: 3,
  hint: 4,
}
