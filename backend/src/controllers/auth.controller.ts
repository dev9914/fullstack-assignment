import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authService } from '../services/auth.service';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as RegisterInput;
  const result = await authService.register(name, email, password);
  res.status(201).json({
    status: 'success',
    data: {
      employee: result.employee,
      token: result.token,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;
  const result = await authService.login(email, password);
  res.status(200).json({
    status: 'success',
    data: {
      employee: result.employee,
      token: result.token,
    },
  });
});
