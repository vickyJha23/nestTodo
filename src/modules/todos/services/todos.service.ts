import { BadRequestException, ConflictException, Injectable, NotFoundException, Search } from '@nestjs/common';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from '../entities/todo.entity';

@Injectable()
export class TodosService {
   constructor(@InjectRepository(Todo) private todoRepo: Repository<Todo>) {}
  async create(createTodoDto: CreateTodoDto) {
       const { title } = createTodoDto;
       const isTodoexist =  await this.todoRepo.exists({where: {title}});
       if(isTodoexist) {
            throw new ConflictException("Todo already exist");
        }
        const todo = this.todoRepo.create(createTodoDto);
        const savedTodo =  await this.todoRepo.save(todo);

        return {
              message: "Todo created successfully",
              data: savedTodo
        }
  } 
  async findAll() {
       const todo = await this.todoRepo.find();
       if(todo.length === 0) {
            throw new NotFoundException("No Todo exist");
       } 
  }
  
 async findOne(id: string) {
      const todo = await this.todoRepo.findOne({where: {id}});
      if(!todo) {
          throw new NotFoundException("Not found");
      }
      return todo
  }

 async update(id: string, updateTodoDto: UpdateTodoDto) {
        const todo = await this.todoRepo.findOne({where: {id}});
        if(!todo) {
             throw new NotFoundException("No Todo found");
        }
        Object.assign(todo, updateTodoDto);
      const updatedTodo =  await this.todoRepo.save(todo);
      return {
           message: "Todo, updated successfully",
           updatedTodo
      }
   }
  async remove(id: string) {
      const todo = await this.todoRepo.find({where: {id}});
      if(!todo) {
           throw new NotFoundException("No todo exist");
      }
      await this.todoRepo.remove(todo);
      return {
          message: "Todo deleted successfully",
          data: null
      }
  }
  async getCompletedTodo() {
         const todos = await this.todoRepo
                      .createQueryBuilder("todo")
                      .where("todo.isCompleted = :isCompleted", {isCompleted: true})
                      .orderBy("todo.createdAt", "ASC")
                      .getMany();
        if(todos.length === 0) {
             throw new NotFoundException("No task completed yet");
         }
         return {
             message: "Completed task fetched succcessfully",
             todos
         }

  }
  async getCompletedTodoCount () {
       const completdTodoCount = await this.todoRepo
                                            .createQueryBuilder("todo")
                                            .addSelect("COUNT(todo.id)", "count")
                                            .where("todo.isCompleted = :isCompleted", {isCompleted: true})
                                            .groupBy("todo.isCompleted")
                                            .getRawOne();
      return {
            message: "Completed todo fetched successfully",
            data: {
                count: completdTodoCount
            }
      }

  }
  
  async searchTask (query: string){
       const todos = await this.todoRepo
                               .createQueryBuilder("todo")
                               .where("LOWER(todo.title) LIKE LOWER(:search)", {search: `${query}`})
                               .getMany();

      if(todos.length === 0) {
            throw new NotFoundException("No matching is todos found");
      }                         

      return {
          message: "Todos fetch successfully",
          todos
      }

  }

  async makeTaskCompletd (id: string) {
      const todo = await this.todoRepo.findOne({where: {id}});
      if(!todo) {
           throw new NotFoundException("No todo found ");
      }
      todo.isCompleted = true;
      const updatedTodo = await this.todoRepo.save(todo);

      return {
           message: "Todo marked successfully",
           updatedTodo
      }
  }
}
