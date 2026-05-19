"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

type MutationOptions = Parameters<typeof useMutation>[0];

export function useOptimisticMutation(
  options: MutationOptions & {
    invalidateKeys?: string[][];
    optimisticUpdate?: (variables: unknown) => void;
  },
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    onMutate: async (variables: unknown) => {
      if (options.optimisticUpdate) {
        await queryClient.cancelQueries();
        options.optimisticUpdate(variables);
      }
      return undefined;
    },
    onError: (error: unknown, variables: unknown) => {
      if (options.invalidateKeys) {
        for (const key of options.invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }
      (options as any).onError?.(error, variables);
    },
    onSettled: (data: unknown, error: unknown, variables: unknown) => {
      if (options.invalidateKeys) {
        for (const key of options.invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }
      (options as any).onSettled?.(data, error, variables);
    },
  });
}
