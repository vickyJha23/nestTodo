import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './configs/database.config';
import jwtConfig from './configs/jwt.config';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TodosModule } from './modules/todos/todos.module';




@Module({

      imports: [
          ConfigModule.forRoot({
               isGlobal: true,
               load: [databaseConfig, jwtConfig]
          }),
          DatabaseModule,
          AuthModule,
          UsersModule,
          TodosModule,
         
      ]
})


export class AppModule {}
