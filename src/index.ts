// Export interfaces from `interface/index.ts`
export * from './interface';

// Export utilities from `utils/index.ts`
export * from './utils';

// Export template utilities
export {
    PARAM_TEMPLATES,
    createParameter,
    createSelectParam,
    createRadioParam,
    createSelectOptions,
} from './templates/templates';

// Export validators
export { BlockchainActionValidator } from './validators/blockchainActionValidator';
export { TransferActionValidator } from './validators/transferActionValidator';
export { HttpActionValidator } from './validators/httpActionValidator';
export { FlowValidator } from './validators/flowValidator';
export { DynamicActionValidator } from './validators/dynamicActionValidator';
export { HTMLActionValidator } from './validators/htmlActionValidator';

// Export file validation functionality
export {
    validateFileParameter,
    validateImageDimensions,
    ParameterValidator,
    isFileParameter,
    isImageParameter,
} from './validators';

// Export file parameter types
export type { FileParameter, ImageParameter, FileInputType } from './interface/inputs';

// Export examples for reference
export { miniApps as exampleMiniApps } from './examples/example-miniapps';
export { transferMiniApps as exampleTransferMiniApps } from './examples/transfer-miniapps';
export { mixedActionMiniApp as exampleMixedMiniApp } from './examples/mixed-miniapp';
export {
    onboardingFlowApp as exampleOnboardingFlow,
    defiSwapFlowApp as exampleDefiSwapFlow,
} from './examples/nested-actions';

// New Executors Architecture
export { BaseExecutor as Executor, type ExecutorOptions } from './executors/baseExecutor';
export {
    DynamicActionExecutor,
    type BlockchainContext,
    createDynamicExecutor,
    createAnonymousExecutor,
} from './executors/dynamicExecutor';
export { MiniAppExecutor } from './executors/miniAppExecutor';

// Export HTTP and HTML executors
export {
    HttpActionExecutor,
    type HttpActionResponse,
    type SecureHttpRequest,
} from './executors/httpExecutor';

export { HTMLActionExecutor, type ContextProvider } from './executors/htmlExecutor';

// Export HTML Action types
export { type ContextData, type ContextSharing } from './interface/actions/htmlAction';

// Export shared action utilities
export {
    ActionParameterValidator,
    SecureRequestBuilder,
    ActionErrorHandler,
    UUIDValidator,
    type BaseParameter,
    type ParameterType,
    type RequestMetadata,
} from './utils/actionUtils';

// Export enhanced header utilities
export { buildHttpActionHeaders, VALID_OPERATIONS, SDK_TO_PROXY_HEADERS } from './headers/headers';
