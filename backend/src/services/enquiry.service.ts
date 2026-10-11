import { AppError } from '../utils/AppError';
import {
  enquiryRepository,
  EnquiryRecord,
  EnquiryInput,
  Pagination,
} from '../repositories/enquiry.repository';

export const enquiryService = {
  async createEnquiry(input: EnquiryInput): Promise<EnquiryRecord> {
    return enquiryRepository.create(input);
  },

  async listUnclaimed(pagination: Pagination = {}): Promise<EnquiryRecord[]> {
    return enquiryRepository.findUnclaimed(pagination);
  },

  async listMyClaims(employeeId: string, pagination: Pagination = {}): Promise<EnquiryRecord[]> {
    return enquiryRepository.findByClaimedBy(employeeId, pagination);
  },

  async claimEnquiry(enquiryId: string, employeeId: string): Promise<EnquiryRecord> {
    const claimed = await enquiryRepository.claimIfUnclaimed(enquiryId, employeeId);
    if (claimed) {
      return claimed;
    }

    const existing = await enquiryRepository.findById(enquiryId);
    if (!existing) {
      throw new AppError('Enquiry not found.', 404);
    }

    throw new AppError('Enquiry has already been claimed.', 409);
  },
};
