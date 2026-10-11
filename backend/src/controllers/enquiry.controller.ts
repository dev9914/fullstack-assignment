import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { enquiryService } from '../services/enquiry.service';
import { CreateEnquiryInput, EnquiryIdParam, ListQuery } from '../schemas/enquiry.schema';

export const createEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateEnquiryInput;
  const enquiry = await enquiryService.createEnquiry(input);
  res.status(201).json({
    status: 'success',
    data: { enquiry },
  });
});

export const listUnclaimed = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as ListQuery;
  const pagination = {
    limit: query.limit,
    offset: query.offset,
  };
  const enquiries = await enquiryService.listUnclaimed(pagination);
  res.status(200).json({
    status: 'success',
    data: { enquiries },
  });
});

export const listMyClaims = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = req.employeeId as string;
  const query = req.query as ListQuery;
  const pagination = {
    limit: query.limit,
    offset: query.offset,
  };
  const enquiries = await enquiryService.listMyClaims(employeeId, pagination);
  res.status(200).json({
    status: 'success',
    data: { enquiries },
  });
});

export const claimEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as EnquiryIdParam;
  const employeeId = req.employeeId as string;
  const enquiry = await enquiryService.claimEnquiry(id, employeeId);
  res.status(200).json({
    status: 'success',
    data: { enquiry },
  });
});
