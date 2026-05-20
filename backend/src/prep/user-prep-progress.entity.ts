import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class UserPrepProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  user: User;

  @Column('simple-array', { default: '' })
  completedMaterialIds: number[];

  @Column('int', { default: 0 })
  streakDays: number;

  @Column('timestamp', { nullable: true })
  lastActiveDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
