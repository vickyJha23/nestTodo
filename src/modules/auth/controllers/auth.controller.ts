import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res, HttpCode } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { LocalAuthGuard } from 'src/common/guards/local.guard';
import type { AuthRequest } from 'src/common/@types';
import type {Response} from "express";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async  create(@Body() createAuthDto: CreateAuthDto) {
        return await this.authService.create(createAuthDto);
   }

  @HttpCode(200)
  @Post("/signin")
  @UseGuards(LocalAuthGuard)
  
  async signIn (@Req() req: AuthRequest, @Res({passthrough: true}) res: Response) {
       return await this.authService.signIn(req, res)
  }

}
