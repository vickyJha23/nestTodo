import { BadRequestException, Body, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import * as bcrypt from "bcrypt";
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { AuthRequest } from 'src/common/@types';
import { accessCookieOptions, refreshCookieOptins } from 'src/common/constants/index.constant';
import type { CookieOptions, Response } from 'express';
import Redis from 'ioredis';
import { genetrateOtp } from 'src/common/utils/generateOtp';
import { MailService } from 'src/common/mail/services/mail.service';
import { VerifyOtpDto } from '../dto/verify-auth.dto';
import { ResetPasswordDto } from '../dto/resetpassword-auth.dto';

@Injectable()
export class AuthService {

  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    @Inject('REDIS_CLIENT') private redis: Redis,
    private mailService: MailService
  ) { }
  async create(createAuthDto: CreateAuthDto) {
    const { email, password } = createAuthDto;
    const exists = await this.userRepo.exists({ where: { email } })

    if (exists) {
      throw new BadRequestException('User already exist!');
    }

    const SALT_ROUNDS = Number(this.configService.get<string>("SALT_ROUNDS")) || 10;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      const user = this.userRepo.create({ ...createAuthDto, password: hashedPassword });
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
  async signIn(req: AuthRequest, res: Response) {
    const user = req.user
    const { accessToken, refreshToken } = await this.issueTokens(user!);
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
  async validateUser(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } })
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    delete (user as any).password

    return user;
  }
  async issueTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

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
  async updatePassword(id: string, newPassword: string) {
    try {
      const user = await this.userRepo.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException("User not found");
      }
      const currentPassword = user.password;
      const isMatch = await bcrypt.compare(newPassword, currentPassword);
      if (isMatch) {
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
  async forgotPassword(email: string) {
    console.log("em", email);
    if(!email) {
         throw new BadRequestException("Email is required");
    }

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException("Invalid email");
    }
    const otp = genetrateOtp();
    const SALT_ROUNDS = await this.configService.get("SALT_ROUNDS") || 10;
    const hashedOtp = await bcrypt.hash(otp, +SALT_ROUNDS);
    console.log(hashedOtp);
    const result = await this.redis.set(`reset-otp:${user.id}`, hashedOtp, 'EX', 300, 'NX')
    console.log(result);
    if (!result) {
      throw new BadRequestException("Otp already sent. Try again after some time")
    }
    try {
      const response = await this.mailService.sendMail(user.email, otp, user.name);
      console.log(response);
    } catch (err) {
       console.log("error", err);
      await this.redis.del(`reset-otp:${user.id}`);
      throw new InternalServerErrorException("Failed to send OTP email. Try again later")
    }

    return {
      message: "User verified successfully",
      email: user.email
    }
  }
  async verifyOtp(verfiyOtp: VerifyOtpDto) {
    const {email, otp} = verfiyOtp;
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException("User Not found");
    }
    const storedOtp = await this.redis.get(`reset-otp:${user.id}`);
    if (!storedOtp) {
      throw new NotFoundException("No reset otp found for this email");
    }

    const isValid = await bcrypt.compare(otp, storedOtp);
    if (!isValid) {
      throw new BadRequestException("Invalid otp");
    }
    await this.redis.del(`reset-otp:${user.id}`);

    const payload = {
      sub: user.id
    }
    const resetToken = this.jwtService.sign(payload, { expiresIn: '5m' });
    const result = await this.redis.set(`reset-token:${user.id}`, resetToken, 'EX', 300, 'NX')
    if(!result) {
          throw new BadRequestException("Reset token has been already set");  
     }

    return {
      message: "OTP verification successfull",
      data: {
          resetToken: resetToken
      }
    }


  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
       const {resetToken, newPassword} = resetPasswordDto;
     try {
      const payload = await this.jwtService.verify(resetToken);
      const id = payload.sub;
      const RESET_TOKEN_ID = `reset-token:${id}`
      const storedToken = await this.redis.get(RESET_TOKEN_ID);
      
      if(!storedToken) {
           throw new BadRequestException("Reset token expired or user");
      }
      if(storedToken !== resetToken) {
            throw new BadRequestException("Invalid reset token")
      }
      await this.redis.del(RESET_TOKEN_ID);
      const user = await this.userRepo.findOne({ where: { id } })
      if (!user) {
        throw new NotFoundException("User not found");
      }

      const SALT_ROUNDS = this.configService.get<string>("SALT_ROUNDS") || 10;
      const hashPassword = await bcrypt.hash(newPassword, +SALT_ROUNDS);
      user.password = hashPassword;
      await this.userRepo.save(user);
      return {
        message: "Password reset successfully",
        data: null
      }

    } catch (err) {
      console.log(err);
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException("Reset token expired")
      }

      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException("Invalid reset token")
      }

      throw new InternalServerErrorException(err.message || "Something went wrong while doing password reset");

    }
  }
 
  async logout(res: Response) {
    
        res.clearCookie("accessToken", accessCookieOptions as CookieOptions);
        res.clearCookie("refreshToken", refreshCookieOptins as CookieOptions);

        return {
             message: "user logout successfully"
        }
  
  }

}
