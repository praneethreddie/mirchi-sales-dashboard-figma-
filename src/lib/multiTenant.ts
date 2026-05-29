/**
 * Multi-tenant data filtering utility
 * This ensures users only access data within their organization
 */

export interface TenantData {
  organizationId: string;
  createdBy: string;
  createdAt: string;
}

/**
 * Filter data to only include records for the current organization
 */
export function filterByOrganization<T extends Partial<TenantData>>(
  data: T[],
  organizationId: string
): T[] {
  return data.filter(item => item.organizationId === organizationId);
}

/**
 * Add organization metadata to a record
 */
export function addTenantMetadata<T extends Partial<TenantData>>(
  data: T,
  organizationId: string,
  userId: string
): T & TenantData {
  return {
    ...data,
    organizationId,
    createdBy: userId,
    createdAt: new Date().toISOString(),
  } as T & TenantData;
}

/**
 * Check if user has access to a record
 */
export function hasAccess(
  record: Partial<TenantData>,
  organizationId: string
): boolean {
  return record.organizationId === organizationId;
}
