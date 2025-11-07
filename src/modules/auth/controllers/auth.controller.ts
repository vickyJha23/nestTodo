import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res, HttpCode, Query } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { LocalAuthGuard } from 'src/common/guards/local.guard';
import type { AuthRequest } from 'src/common/@types';
import type {Response} from "express";
import { VerifyOtpDto } from '../dto/verify-auth.dto';
import { ResetPasswordDto } from '../dto/resetpassword-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';

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

  @Post("forgot-password")
  async forgotPassword (@Query('email') email: string ) {
       return await this.authService.forgotPassword(email)
  }

  @Post("verify-otp") 
  async verfiyOtp (@Body() verfiyOtpDto: VerifyOtpDto) {
       return await this.authService.verifyOtp(verfiyOtpDto)
   }

   @Post("reset-password")
   async resetPassword (@Body() resetPasswordDto: ResetPasswordDto) {
        return await this.authService.resetPassword(resetPasswordDto);
    }

    @Post("logout")
    @UseGuards(JwtAuthGuard)
    async logout(@Res({passthrough: true}) res: Response) {
         return await this.authService.logout(res);
    }


}
