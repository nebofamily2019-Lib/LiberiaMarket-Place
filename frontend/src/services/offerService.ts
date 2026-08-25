import api from '../utils/api';

export interface Offer {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  offer_amount: number;
  currency: 'USD' | 'LRD';
  counter_amount?: number;
  counter_currency?: 'USD' | 'LRD';
  product_price_snapshot: number;
  message?: string;
  counter_message?: string;
  responded_by?: string;
  offer_count: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired' | 'completed';
  // Delivery confirmation fields
  delivery_method?: 'delivery' | 'pickup' | null;
  seller_confirmed: boolean;
  seller_confirmed_at?: string | null;
  buyer_confirmed: boolean;
  buyer_confirmed_at?: string | null;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    title: string;
    price: number;
    images?: string[];
    status: string;
  };
  buyer?: {
    id: string;
    name: string;
    phone: string;
  };
  seller?: {
    id: string;
    name: string;
    phone: string;
  };
}

export interface CreateOfferData {
  product_id: string;
  offer_amount: number;
  currency: 'USD' | 'LRD';
  message?: string;
}

export interface CounterOfferData {
  counter_amount: number;
  counter_currency: 'USD' | 'LRD';
  counter_message?: string;
}

export const placeBid = async (productId: string, amount: number): Promise<any> => {
  const response = await api.post('/offers/bid', { product_id: productId, bid_amount: amount });
  return response.data;
};

export const buyNow = async (productId: string): Promise<any> => {
  const response = await api.post('/offers/buy-now', { product_id: productId });
  return response.data;
};

/**
 * Create a new offer on a product
 */
export const createOffer = async (data: CreateOfferData): Promise<Offer> => {
  const response = await api.post('/offers', data);
  return response.data.data;
};

/**
 * Get offers sent by the current buyer
 */
export const getSentOffers = async (status?: string): Promise<Offer[]> => {
  const params = status ? { status } : {};
  const response = await api.get('/offers/sent', { params });
  return response.data.data;
};

/**
 * Get offers received by the current seller
 */
export const getReceivedOffers = async (status?: string): Promise<Offer[]> => {
  const params = status ? { status } : {};
  const response = await api.get('/offers/received', { params });
  return response.data.data;
};

/**
 * Get my offer for a specific product
 */
export const getMyOfferForProduct = async (productId: string): Promise<Offer | null> => {
  const response = await api.get(`/offers/my-offer/${productId}`);
  return response.data.data;
};

/**
 * Accept an offer
 * - Seller accepts buyer's initial offer
 * - Buyer accepts seller's counter-offer
 */
export const acceptOffer = async (offerId: string): Promise<void> => {
  await api.patch(`/offers/${offerId}/accept`);
};

/**
 * Reject an offer
 * - Seller rejects buyer's initial offer
 * - Buyer rejects seller's counter-offer
 */
export const rejectOffer = async (offerId: string): Promise<void> => {
  await api.patch(`/offers/${offerId}/reject`);
};

/**
 * Counter an offer (Seller only)
 */
export const counterOffer = async (offerId: string, data: CounterOfferData): Promise<void> => {
  await api.patch(`/offers/${offerId}/counter`, data);
};

/**
 * Seller chooses how the item will get to the buyer (Seller only)
 */
export const setDeliveryMethod = async (offerId: string, delivery_method: 'delivery' | 'pickup'): Promise<Offer> => {
  const response = await api.patch(`/offers/${offerId}/delivery-method`, { delivery_method });
  return response.data.data;
};

/**
 * Seller confirms the item has been handed over / delivered (Seller only)
 * `completed` is true once both parties have confirmed and the sale is finalized.
 */
export const sellerConfirmDelivery = async (offerId: string): Promise<{ data: Offer; completed?: boolean }> => {
  const response = await api.patch(`/offers/${offerId}/seller-confirm`);
  return response.data;
};

/**
 * Buyer confirms they received the item (Buyer only)
 * `completed` is true once both parties have confirmed and the sale is finalized.
 */
export const buyerConfirmReceipt = async (offerId: string): Promise<{ data: Offer; completed?: boolean }> => {
  const response = await api.patch(`/offers/${offerId}/buyer-confirm`);
  return response.data;
};

/**
 * Get offer status badge color
 */
export const getOfferStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return '#FFA500'; // Orange
    case 'accepted':
      return '#10B981'; // Green
    case 'rejected':
      return '#EF4444'; // Red
    case 'countered':
      return '#3B82F6'; // Blue
    case 'expired':
      return '#6B7280'; // Gray
    case 'completed':
      return '#10B981'; // Green
    default:
      return '#6B7280';
  }
};

/**
 * Get offer status display text
 */
export const getOfferStatusText = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'accepted':
      return 'Accepted';
    case 'rejected':
      return 'Rejected';
    case 'countered':
      return 'Counter-Offer';
    case 'expired':
      return 'Expired';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
};
