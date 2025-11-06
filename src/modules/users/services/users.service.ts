import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import bcrypt from "bcrypt";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private userRepo: Repository<User>, private  configService: ConfigService) { }


  async findAll() {
    try {
      let users = await this.userRepo.find();
      if (users.length === 0) {
        throw new BadRequestException("No user exists")
      }
      users = users.map((user) => {
        delete (user as any).password;
        return user
      })

      return {
        message: "Users fetched successFully",
        data: users
      }

    } catch (error) {
      throw new InternalServerErrorException(error.message || "Error while fetching the users");
    }

  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException("User not found");
    }
    delete (user as any).password;

    return {
      message: "User Prolfile fetched successfully",
      data: user
    }

  }
  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepo.findOne({ where: { id } })
      if (!user) {
        throw new NotFoundException("User Not Found");
      }

      Object.assign(user, updateUserDto);

      const updatedUser = await this.userRepo.save(user);
      delete (updatedUser as any).password;
      return {
        message: "User profile updated successfully",
        data: updatedUser
      }

    } catch (error) {
      throw new InternalServerErrorException(error.message || "Internal Server error while updating user profile");
    }
  }
  async updateRole (id: string, updateRoleChangeDto: {role?: string}) {
        try {
             let user = await this.userRepo.findOne({where: {id}});
             if(!user) {
                 throw new NotFoundException("User not found");
             }
             Object.assign(user, updateRoleChangeDto);
             user = await this.userRepo.save(user);
             delete (user as any).password
             return  {
                   message: "Role has been changed successfully",
                  data: user
             }

        } catch (error) {
            throw new InternalServerErrorException("Something went wrong while changing the role")
        }
  }
  
  async updatePassword (id:string, newPassword:string) {
        try {
               const user = await this.userRepo.findOne({where: {id}});
           if(!user) {
              throw new NotFoundException("User not found");
            }
            const currentPassword = user.password;
            const isMatch = await bcrypt.compare(newPassword, currentPassword);  
            if(isMatch) {
                   throw new ConflictException("New password is same as of current password");
             }

            const SALT_ROUNDS = Number(this.configService.get<string>("SALT_ROUNDS")) || 10; 
            const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
            user.password = hashedPassword;
            const updatedUser = await this.userRepo.save(user);
            delete (updatedUser as any).password;
            
            return {
                    message: "Password updated successfully",
                    data: updatedUser
             }

        } catch (error) {
             throw new InternalServerErrorException("Something went wrong while updating password");
        }
   }
   
   async forgotPassword (email: string) {
          const user = await this.userRepo.findOne({where: {email}});
          if(!user) {
             throw new BadRequestException("Invalid email");
           }



    }


  async remove(id: string) {
    try {
      const user = await this.userRepo.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException("No user with this id");
      }
      await this.userRepo.remove(user);
      return {
        message: "User deleted successfully",
        data: null
      }
    } catch (error) {
      throw new InternalServerErrorException("Something went wrong while deleting the user")
    }

  }
}
