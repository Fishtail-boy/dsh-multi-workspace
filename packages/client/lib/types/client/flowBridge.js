/**
 * Bridge between the wrapped `pickDirectory` call and the mounted dialog.
 *
 * The built-in add-workspace flow asks the workspace service for a single
 * directory. We answer that request with our own multi-folder dialog instead of
 * the OS chooser: the wrapped call parks a resolver here, the mounted flow
 * component opens, and the outcome settles the parked call (always `null`, so
 * the built-in flow does not create a second workspace on top of ours).
 */
let pending;
const listeners = new Set();
/** Park one create request; resolves when the dialog finishes. */
export function requestCreateFlow() {
    return new Promise((resolve) => {
        pending = resolve;
        for (const listener of listeners)
            listener();
    });
}
/** Subscribe the mounted dialog to create requests. */
export function subscribeCreateFlow(listener) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}
/** Settle the parked request; the dialog owns the actual workspace creation. */
export function settleCreateFlow() {
    const settle = pending;
    pending = undefined;
    settle?.(null);
}
/** Whether a create request is waiting for the dialog. */
export function hasPendingCreateFlow() {
    return pending !== undefined;
}
//# sourceMappingURL=flowBridge.js.map