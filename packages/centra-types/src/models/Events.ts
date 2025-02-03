/**
 * A webhook event, dispatched from the Centra Webhook plugin.
 *
 * @see https://centra.dev/docs/services/centra-webhooks
 */
export type Events =
  | 'affiliates'
  | 'brands'
  | 'campaignSites'
  | 'campaigns'
  | 'categories'
  | 'cmsArticles'
  | 'giftCertificates'
  | 'mapsLocations'
  | 'mapsRegion'
  | 'markets'
  | 'pricelists'
  | 'products'
  | 'statics'
  | 'warehouseGroups'
  | 'warehouses'
