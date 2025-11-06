import { BadRequestException, Body, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import * as bcrypt from "bcrypt";
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthRequest } from 'src/common/@types';
import { accessCookieOptions, refreshCookieOptins } from 'src/common/constants/index.constant';
import { CookieOptions, Response } from 'express';
import Redis from 'ioredis';
import { genetrateOtp } from 'src/common/utils/generateOtp';

@Injectable()
export class AuthService {

  constructor (private configService: ConfigService, @InjectRepository(User) private userRepo: Repository<User>, private jwtService: JwtService, @Inject('REDIS_CLIENT') private redis: Redis) {}

  async create(createAuthDto: CreateAuthDto) {
      const { email , password } = createAuthDto;  
      const exists = await this.userRepo.exists({ where: {email}})
      
      if(exists) {
            throw new BadRequestException('User already exist!');     
        }
      
      const SALT_ROUNDS =  Number(this.configService.get<string>("SALT_ROUNDS")) || 10;
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);  

        try {
            const user = this.userRepo.create({...createAuthDto, password: hashedPassword});
            const savedUser = await this.userRepo.save(user);
            
            delete (savedUser as any).password;

            return {
                  message: "User created successfully",
                  data: savedUser
            }

        } catch (error) {
              console.error(error);
              throw new InternalServerErrorException("Failed to create user")
         }

    }

    async signIn(req: AuthRequest, res:Response) {
         const user = req.user
         const {accessToken, refreshToken} = await this.issueTokens(user!);
         res.cookie("accessToken", accessToken, accessCookieOptions as CookieOptions);
          res.cookie("refreshToken", refreshToken, refreshCookieOptins as CookieOptions)
           
          return {
             message: "User sign in successfully",
             data: {
               accessToken: accessToken,
               refreshToken: refreshToken,
               user: user
             }
         } 
     }

     async validateUser (email: string, password: string) {
           const user = await this.userRepo.findOne({where: {email}})
           if(!user) return null;
           
           const isMatch= await bcrypt.compare(password, user.password);
           if(!isMatch) return null;

           delete (user as any).password
           
           return user;
     }

     async issueTokens(user: User) {
          const payload = {sub: user.id, email: user.email, role: user.role};

          const accessToken = await this.jwtService.signAsync(payload, {            
            secret: this.configService.get<string>('jwt.accessTokenSecret'),
            expiresIn: this.configService.get("jwt.accessTokenExpiry")
          })


         const refreshToken = await this.jwtService.signAsync(payload, {
               secret: this.configService.get<string>('jwt.refreshTokenSecret'),
               expiresIn: this.configService.get('jwt.refreshTokenExpiry') 
         }) 


          return { accessToken, refreshToken };
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
                const otp = genetrateOtp();
               const result = this.redis.set(`reset-otp:${user.id}`, otp, 'EX', 300, 'NX')
         
                // mailer service 

                if(!result) {
                     throw new BadRequestException("Otp already sent")
                    } 

                return {
                    message: "User verified successfully",
                    email: user.email     
                }
         }
         
     

}
