import { User } from "src/modules/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Todo {

     @PrimaryGeneratedColumn('uuid')   
     id: string;

     @Column({unique: true})
     title: string;

     @Column({default: false})
     isCompleted: boolean;

     @ManyToOne(() => User, (user) => user.todos, {
          onDelete: "CASCADE"
     })
     user: User



}
