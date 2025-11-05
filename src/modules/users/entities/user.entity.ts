import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Todo } from "src/modules/todos/entities/todo.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({unique: true})
    userName: string;

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

    @Column({type: 'enum', default: 'user', enum: ['user', 'admin']}) 
    role: 'user' | 'admin'

    @OneToMany(() => Todo, (todo) => todo.user)
    todos: Todo[];

    @CreateDateColumn()
    createdAt: Date

}
