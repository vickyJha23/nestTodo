import { BadRequestException, Body, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import * as bcrypt from "bcrypt";
import { ConfigService } from '@nestjs/config';
import { SignInDto } from '../dto/signin-auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor (private configService: ConfigService, @InjectRepository(User) private userRepo: Repository<User>, private jwtService: JwtService) {}

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
            
            return {
                  message: "User created successfully",
                  data: savedUser
            }

        } catch (error) {
              console.error(error);
              throw new InternalServerErrorException("Failed to create user")
         }

    }

    async signIn(req: Request) {
         const user = req.user
         const {accessToken, refreshToken} = await this.issueTokens(user);
          


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
          const payload = {sub: user.id, email: user.email};

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

}
