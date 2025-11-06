import { Controller, Get, Body, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import type { JwtAuthRequest } from 'src/common/@types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

 
  @Get("all-users")
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get("profile") 
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: JwtAuthRequest) {
        console.log("req", req.user);
        return this.usersService.findOne(req?.user?.sub!); 
   }

   
  @Patch('update-profile')
  @UseGuards(JwtAuthGuard)
  update(@Req() req: JwtAuthRequest,  @Body() updateUserDto: UpdateUserDto) {
         console.log(updateUserDto);
         return this.usersService.update(req?.user?.sub, updateUserDto);
   }

  @Delete('delete-profile')
  remove(@Req() req: JwtAuthRequest) {
    return this.usersService.remove(req?.user?.sub);
  }
}
