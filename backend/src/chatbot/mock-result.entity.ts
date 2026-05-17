import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class MockResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  company: string;

  @Column()
  role: string;

  @Column('simple-array')
  questions: string[];

  @Column('simple-array')
  answers: string[];

  @Column('text')
  evaluation: string;

  @Column('int')
  score: number;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => User)
  user: User;
}
