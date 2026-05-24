export interface UpsertCustomerDto {
  businessId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}
