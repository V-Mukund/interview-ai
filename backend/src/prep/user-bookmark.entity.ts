import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { PrepMaterial } from './prep-material.entity';

@Entity()
export class UserBookmark {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => PrepMaterial, material => material.id, { onDelete: 'CASCADE' })
  material: PrepMaterial;

  @CreateDateColumn()
  createdAt: Date;
}
