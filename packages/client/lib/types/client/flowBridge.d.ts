/**
 * Bridge between the wrapped `pickDirectory` call and the mounted dialog.
 *
 * The built-in add-workspace flow asks the workspace service for a single
 * directory. We answer that request with our own multi-folder dialog instead of
 * the OS chooser: the wrapped call parks a resolver here, the mounted flow
 * component opens, and the outcome settles the parked call (always `null`, so
 * the built-in flow does not create a second workspace on top of ours).
 */
/** Park one create request; resolves when the dialog finishes. */
export declare function requestCreateFlow(): Promise<string | null>;
/** Subscribe the mounted dialog to create requests. */
export declare function subscribeCreateFlow(listener: () => void): () => void;
/** Settle the parked request; the dialog owns the actual workspace creation. */
export declare function settleCreateFlow(): void;
/** Whether a create request is waiting for the dialog. */
export declare function hasPendingCreateFlow(): boolean;
