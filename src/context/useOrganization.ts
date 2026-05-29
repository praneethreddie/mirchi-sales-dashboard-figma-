import { useAuth } from "./AuthContext";
import { filterByOrganization } from "../lib/multiTenant";

/**
 * Hook to filter data by current user's organization
 * Use this hook whenever you fetch data to ensure multi-tenancy
 */
export function useOrganizationData<T extends { organizationId?: string }>(data: T[]): T[] {
  const { organizationId } = useAuth();
  
  if (!organizationId) {
    return [];
  }

  // If data doesn't have organizationId (legacy data), show all
  // In production, you should migrate all data to include organizationId
  const hasOrgField = data.some(item => 'organizationId' in item);
  if (!hasOrgField) {
    return data; // Fallback to showing all data if organizationId field doesn't exist
  }

  return filterByOrganization(data, organizationId);
}

/**
 * Hook to get the current organization ID
 */
export function useOrganizationId(): string {
  const { organizationId } = useAuth();
  if (!organizationId) {
    throw new Error("User is not authenticated or has no organization");
  }
  return organizationId;
}
