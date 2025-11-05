import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { UpdateAuthDto } from '../dto/update-auth.dto';
import { LocalAuthGuard } from 'src/common/guards/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async  create(@Body() createAuthDto: CreateAuthDto) {
        return await this.authService.create(createAuthDto);
   }

  
  @Post("/signin")
  @UseGuards(LocalAuthGuard)
  
  async signIn () {
       await this.authService.signIn()
  }

}
