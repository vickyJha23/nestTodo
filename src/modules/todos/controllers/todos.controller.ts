import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { TodosService } from '../services/todos.service';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';


@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post("create")
  async create(@Body() createTodoDto: CreateTodoDto) {
       return await this.todosService.create(createTodoDto);
  }

  @Get()
  findAll() {
    return this.todosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todosService.findOne(id);
  }

  @Patch('update-todo/:id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(id, updateTodoDto);
  }

  @Delete('delete-todo/:id')
  remove(@Param('id') id: string) {
    return this.todosService.remove(id);
  }

  @Get() 
  async getCompletedTodo() {
       await this.todosService.getCompletedTodo();
  }

  @Get() 
  async getCompletedTodoCount () {
       await this.todosService.getCompletedTodoCount()
  }

 @Put("mark-completed/:id") 
 async makeTaskCompleted (@Param("id") id: string) {
     await this.todosService.makeTaskCompletd(id);
 }
}
