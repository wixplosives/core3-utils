import type {
    CompletionItem,
    ColorInformation,
    ColorPresentation,
    Location,
    DocumentHighlight,
    DocumentSymbol,
    SignatureHelp,
    TextEdit,
    Hover,
    Diagnostic,
    Range,
} from 'vscode-languageserver-types';

export interface LanguageSupportProvider {
    supportsFileType(filePath: string): boolean;
}

export interface CompletionProvider {
    completionTriggerChars?: string[];
    getCompletionItems(filePath: string, pos: number, triggerChar?: string): ProviderResult<CompletionItem[]>;
    getCompletionItemDetails?(
        filePath: string,
        pos: number,
        itemLabel: string | CompletionItemLabel
    ): ProviderResult<CompletionDetails>;
}

export interface SignatureHelpProvider {
    signatureHelpTriggerChars?: string[];
    getSignatureHelp(filePath: string, pos: number): ProviderResult<SignatureHelp>;
}

export interface HoverInfoProvider {
    getHoverInfo(filePath: string, pos: number): ProviderResult<Hover>;
}

export interface DefinitionsProvider {
    getDefinitions(filePath: string, pos: number): ProviderResult<Location[]>;
}

export interface DocumentHighlightsProvider {
    getDocumentHighlights(filePath: string, pos: number): ProviderResult<DocumentHighlight[]>;
}

export interface DocumentSymbolsProvider {
    getDocumentSymbols(filePath: string): ProviderResult<DocumentSymbol[]>;
}

export interface ReferencesProvider {
    getReferences(filePath: string, pos: number): ProviderResult<Location[]>;
}

export interface RangeFormattingEditsProvider {
    getRangeFormattingEdits(filePath: string, range: Range, options: FormattingOptions): ProviderResult<TextEdit[]>;
}

export interface OnTypeFormattingProvider {
    autoFormatTriggerCharacters: string[];
    getOnTypeFormatting(
        filePath: string,
        pos: number,
        key: string,
        options: FormattingOptions
    ): ProviderResult<TextEdit[]>;
}

export interface DiagnosticsProvider {
    getDiagnostics(filePath: string): ProviderResult<Diagnostic[]>;
}

export interface DocumentColorProvider {
    provideDocumentColors(filePath: string): ProviderResult<ColorInformation[]>;
    provideColorPresentations(filePath: string, colorInfo: ColorInformation): ProviderResult<ColorPresentation[]>;
}

export interface LanguageProvider
    extends LanguageSupportProvider,
        Partial<CompletionProvider>,
        Partial<SignatureHelpProvider>,
        Partial<HoverInfoProvider>,
        Partial<DefinitionsProvider>,
        Partial<DocumentHighlightsProvider>,
        Partial<DocumentSymbolsProvider>,
        Partial<ReferencesProvider>,
        Partial<RangeFormattingEditsProvider>,
        Partial<OnTypeFormattingProvider>,
        Partial<DiagnosticsProvider>,
        Partial<DocumentColorProvider> {}

export type ProviderResult<T> = T | undefined | Promise<T | undefined>;

export interface OffsetRange {
    start: number;
    length: number;
}

export interface CompletionItemLabel {
    label: string;
    detail?: string;
    description?: string;
}

export interface CompletionDetails {
    documentation?: string;
    detail?: string;
}

export interface SignatureInfo {
    label: string;
    documentation?: string | MarkdownString;
    parameters: ParameterInfo[];
}

export interface ParameterInfo {
    label: string | [number, number];
    documentation?: string | MarkdownString;
}

export interface MarkdownString {
    value: string;
    isTrusted?: boolean;
}

export enum SymbolKind {
    File = 0,
    Module = 1,
    Namespace = 2,
    Package = 3,
    Class = 4,
    Method = 5,
    Property = 6,
    Field = 7,
    Constructor = 8,
    Enum = 9,
    Interface = 10,
    Function = 11,
    Variable = 12,
    Constant = 13,
    String = 14,
    Number = 15,
    Boolean = 16,
    Array = 17,
    Object = 18,
    Key = 19,
    Null = 20,
    EnumMember = 21,
    Struct = 22,
    Event = 23,
    Operator = 24,
    TypeParameter = 25,
}

export interface FormattingOptions {
    tabSize: number;
    insertSpaces: boolean;
}

export interface Color {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}
