import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './configs/database.config';
import jwtConfig from './configs/jwt.config';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TodosModule } from './modules/todos/todos.module';
import { AdminModule } from './modules/admin/admin.module';
import redisConfig from './configs/redis.config';
import mailConfig from './configs/mail.config';
import { MailModule } from './common/mail/mail.module';


@Module({

      imports: [
          ConfigModule.forRoot({
               isGlobal: true,
               load: [databaseConfig, jwtConfig, redisConfig, mailConfig]
          }),
          DatabaseModule,
          AuthModule,
          UsersModule,
          AdminModule,  
          TodosModule,
          MailModule
      ]
})


export class AppModule {}
