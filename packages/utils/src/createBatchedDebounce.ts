type Callback<T> = (args: T[]) => void
type ShouldFlush<T> = (queue: T[]) => boolean

/**
 * Creates a batched debounce function that accumulates arguments over a defined
 * period and invokes a callback once certain conditions are met.
 *
 * This function is useful for scenarios where you want to gather multiple
 * calls over a period of time (batching) and process them all at once, either
 * when a specified `wait` period is reached, or based on a custom flush condition.
 *
 * @param callback - A function to be called with the accumulated arguments
 *                   once either the `wait` time has elapsed or `shouldFlush` condition is met.
 * @param wait - The debounce time in milliseconds. After this period, the `callback`
 *               will be invoked with all accumulated arguments if `shouldFlush` has not already done so.
 * @param shouldFlush - A function that takes the queued arguments as input and returns
 *                      a boolean indicating whether the `callback` should be invoked immediately.
 *                      If `true`, the queue is flushed, and the callback is invoked.
 *
 * @returns A debounced function that can be called with an argument of type `T`.
 *          This function will accumulate calls until either the `wait` time has elapsed or
 *          `shouldFlush` returns `true`, then invokes the callback with all accumulated arguments.
 *
 * @example
 * ```typescript
 * // Example usage: batching API calls
 * const batchedApiCall = createBatchedDebounce(
 *   (requests) => sendBatchedRequests(requests), // Callback to process the batch
 *   200,                                         // Wait time of 200ms
 *   (queue) => queue.length >= 5                 // Flush if there are 5 or more requests
 * );
 *
 * // Each call below is debounced and batched based on the provided conditions
 * batchedApiCall({ url: "/api/data/1" });
 * batchedApiCall({ url: "/api/data/2" });
 * ```
 */
export function createBatchedDebounce<T>(
  callback: Callback<T>,
  wait: number,
  shouldFlush?: ShouldFlush<T>,
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let argsQueue: T[] = []

  return (arg: T) => {
    argsQueue.push(arg)

    // // Clear timeout to reset the debounce period
    // if (timeoutId) clearTimeout(timeoutId);

    // Check if the shouldFlush condition is met
    if (shouldFlush?.(argsQueue)) {
      callback(argsQueue)
      argsQueue = []
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = null
      return
    }

    // Set a new timeout to process the queue after the specified wait time
    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        callback(argsQueue)
        argsQueue = []
        timeoutId = null
      }, wait)
    }
  }
}
