export interface Enquiry {
  _id?: string; // Optional, as it may not always be present
  name: string;
  email: string;
  phone?: string; // Optional, as phone may not always be provided
  subject?: string;
  message: string;
  createdAt: string; // Assuming API returns createdAt as a string (ISO date format)
}