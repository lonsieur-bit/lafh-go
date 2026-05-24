import { useQuery } from "@tanstack/react-query";
import {
  DEFAULT_MAINTENANCE_MESSAGE_AR,
  fetchPlatformSettings,
  PLATFORM_SETTINGS_QUERY_KEY,
} from "../api/platformSettings";

export function usePlatformAppEnabled() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: PLATFORM_SETTINGS_QUERY_KEY,
    queryFn: fetchPlatformSettings,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  return {
    isLoading,
    appEnabled: data?.app_enabled ?? true,
    maintenanceMessage: data?.maintenance_message_ar ?? DEFAULT_MAINTENANCE_MESSAGE_AR,
    refetch,
  };
}
