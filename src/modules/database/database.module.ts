import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Todo } from "../todos/entities/todo.entity";
import { User } from "../users/entities/user.entity";




@Module({

     imports: [
         TypeOrmModule.forRootAsync({
              inject: [ConfigService],
              useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
                     type: 'mysql',
                     host: config.get<string>('database.host'),
                     port: config.get<number>('database.port'),
                     username: config.get<string>('database.username'),
                     password: config.get<string>('database.password'),
                     database: 'todoapp',
                     entities: [User, Todo],
                     synchronize: true,
                     retryAttempts: 0
              }) 
         })
     ]
    
})

export class DatabaseModule {

}