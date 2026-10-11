import { Router } from 'express';
import {
  createEnquiry,
  listUnclaimed,
  listMyClaims,
  claimEnquiry,
} from '../controllers/enquiry.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createEnquirySchema,
  enquiryIdParamSchema,
  listQuerySchema,
} from '../schemas/enquiry.schema';

const router = Router();

router.post('/', validate(createEnquirySchema), createEnquiry);

router.get('/unclaimed', authenticate, validate(listQuerySchema, 'query'), listUnclaimed);

router.get('/my', authenticate, validate(listQuerySchema, 'query'), listMyClaims);

router.patch('/:id/claim', authenticate, validate(enquiryIdParamSchema, 'params'), claimEnquiry);

export default router;
