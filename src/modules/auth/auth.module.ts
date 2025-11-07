import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { RedisModule } from '../redis/redis.module';
import { MailModule } from 'src/common/mail/mail.module';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';


@Module({
  imports: [TypeOrmModule.forFeature([User], 
  ), 
  JwtModule.registerAsync({
       inject: [ConfigService],
       useFactory: (config: ConfigService) => ({
           secret: config.get<string>("jwt.resetToken") || "secret"
       })
  }),
  UsersModule,
  RedisModule,
  MailModule
],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [JwtStrategy]
})
export class AuthModule {}
