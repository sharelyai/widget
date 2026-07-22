import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGlobalStore } from "../stores/globalStore";
import { useSharelyContext } from "../provider";

interface ISpaceProps {
  enabled?: boolean;
  spaceId: string;
}

export const useSpace = (props: ISpaceProps) => {
  const { enabled = true, spaceId } = props;
  const { externalToken } = useGlobalStore();
  const { apiClient } = useSharelyContext();
  const queryClient = useQueryClient();

  const isEnabled = enabled && Boolean(spaceId);
  const queryKey = ["space", spaceId];

  // Host-asserted identity uses the authenticated endpoint;
  // anonymous (temporal token only) uses the public one.
  const url = externalToken
    ? `/spaces/${spaceId}`
    : `/public-spaces/${spaceId}`;

  const response = useQuery({
    queryKey,
    queryFn: () => {
      return apiClient.fetcher(url);
    },
    enabled: isEnabled,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
  });

  const mutate = async (data: any, refetch = false) => {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (typeof data === "function") {
        return data(oldData || []);
      }
      if (!oldData) return [data];
      return [...oldData, data];
    });
    if (refetch) {
      await response.refetch();
    }
  };

  return {
    space: response.data,
    isLoading: response.isLoading,
    spaceOptions: response,
    spaceRefetch: response.refetch,
    spaceMutate: mutate,
  };
};
