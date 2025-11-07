import { Module } from '@nestjs/common';
import { TodosService } from './services/todos.service';
import { TodosController } from './controllers/todos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([Todo]),
      UsersModule
  ],
  controllers: [TodosController],
  providers: [TodosService, JwtStrategy],
})
export class TodosModule {}
