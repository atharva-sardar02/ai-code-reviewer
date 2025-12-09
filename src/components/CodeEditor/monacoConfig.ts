let isConfigured = false

/**
 * Configure Monaco Editor's TypeScript/JavaScript language service
 * to reduce false positive error squiggles
 * This function is idempotent and only configures once
 */
export function configureMonaco() {
  // Only configure once
  if (isConfigured) return

  // Wait for Monaco to be available
  if (typeof window !== 'undefined' && (window as any).monaco) {
    const monaco = (window as any).monaco

    if (monaco.languages && monaco.languages.typescript) {
      // Configure TypeScript defaults - disable semantic validation to prevent false errors
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true, // Disable semantic validation (type checking)
        noSyntaxValidation: false, // Keep syntax validation for actual syntax errors
        noSuggestionDiagnostics: true, // Disable suggestion diagnostics
      })

      // Configure JavaScript defaults
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false,
        noSuggestionDiagnostics: true,
      })

      // Set compiler options for better JSX/TSX support
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.Latest,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
        typeRoots: ['node_modules/@types'],
      })

      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.Latest,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
        typeRoots: ['node_modules/@types'],
      })

      isConfigured = true
    }
  }
}

