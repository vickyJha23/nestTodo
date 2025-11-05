import { Module } from '@nestjs/common';
import { TodosService } from './services/todos.service';
import { TodosController } from './controllers/todos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([Todo])
  ],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}
