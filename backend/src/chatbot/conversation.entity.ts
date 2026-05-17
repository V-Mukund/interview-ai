import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  role: string;

  @Column({ nullable: true })
  difficulty: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true, default: 'mentor' })
  mode: string;

  @Column('simple-json', { nullable: true })
  messages: { sender: 'user' | 'bot'; content: string; timestamp: Date }[];

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  user: User;
}
