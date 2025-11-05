import { User } from "src/modules/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Todo {

     @PrimaryGeneratedColumn('uuid')   
     id: string;
     @Column()
     title: string;

     @Column({default: false})
     isCompleted: string;

     @ManyToOne(() => User, (user) => user.todos, {
          onDelete: "CASCADE"
     })
     user: User



}
