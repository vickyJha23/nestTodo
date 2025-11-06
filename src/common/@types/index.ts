import { Request } from "express";
import { User } from "src/modules/users/entities/user.entity";

export interface AuthRequest extends Request {
       user?: User
}

export interface JwtAuthRequest extends Request {
         user: {
              sub: string,
              email: string
         }
}