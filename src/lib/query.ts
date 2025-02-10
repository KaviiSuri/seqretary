import { isEqual, debounce } from "lodash";
import React, { useEffect } from "react";
import { useLogseqReady } from "@/components/LogseqReadyProvider";

const DEBOUNCE_MS = 300; // Adjust this value as needed

type DBQueryResult = Awaited<ReturnType<typeof logseq.DB.datascriptQuery>>;

export function onQueryChanged<T>(
  query: string,
  handler: (results: T[]) => void,
  options: {
    signal?: AbortSignal;
    debounceMs?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inputs?: any[];
  } = {},
) {
  let lastResults: T[] | null = null;

  const runQuery = async () => {
    try {
      console.debug("running query", query, options.inputs);
      const results = await logseq.DB.datascriptQuery(
        query,
        ...(options.inputs ?? []),
      );

      console.debug("results", query, results, lastResults);
      // Use lodash's isEqual for deep comparison
      if (!isEqual(results, lastResults)) {
        lastResults = results;
        handler(results);
      }
    } catch (error) {
      console.error("Query error:", error);
    }
  };

  // Create debounced version of runQuery
  const debouncedRunQuery = debounce(
    runQuery,
    options.debounceMs ?? DEBOUNCE_MS,
  );

  // Initial query (not debounced)
  console.log("initial query");
  runQuery();

  // Set up the change listener with debounced query
  const unsubscribe = logseq.DB.onChanged(async () => {
    console.log("onChanged");
    // If the signal is aborted, unsubscribe
    if (options.signal?.aborted) {
      unsubscribe();
      return;
    }

    // Re-run query when DB changes (debounced)
    await debouncedRunQuery();
  });

  // Clean up if AbortSignal is provided
  options.signal?.addEventListener("abort", () => {
    debouncedRunQuery.cancel(); // Cancel any pending debounced calls
    unsubscribe();
  });

  // Return cleanup function
  return () => {
    debouncedRunQuery.cancel(); // Cancel any pending debounced calls
    unsubscribe();
  };
}

interface UseLogseqQueryOptions {
  debounceMs?: number;
  enabled?: boolean;
  inputs?: any[];
}

export function useLogseqQuery<T>(
  query: string,
  options: UseLogseqQueryOptions = {},
) {
  const { ready } = useLogseqReady();
  const { debounceMs, enabled = true, inputs } = options;
  const [results, setResults] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    // Don't run queries if Logseq isn't ready or queries are disabled
    if (!ready || !enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const abortController = new AbortController();

    const cleanup = onQueryChanged<T>(
      query,
      (newResults) => {
        try {
          setResults(newResults);
          setLoading(false);
        } catch (err) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
          setLoading(false);
        }
      },
      {
        signal: abortController.signal,
        debounceMs,
        inputs,
      },
    );

    return () => {
      cleanup();
      abortController.abort();
    };
  }, [query, enabled, debounceMs, inputs, ready]);

  useEffect(() => {
    console.log("inputs", inputs);
  }, [inputs]);

  useEffect(() => {
    console.log("query", query);
  }, [query]);

  useEffect(() => {
    console.log("enabled", enabled);
  }, [enabled]);

  return {
    results,
    loading,
    error,
    isError: error !== null,
    ready,
  };
}

