import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class PrepMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  title: string;

  @Column('varchar')
  category: string;

  @Column('varchar', { nullable: true })
  company: string;

  @Column('varchar', { nullable: true })
  role: string;

  @Column('varchar', { default: 'Intermediate' })
  difficulty: string;

  @Column('text')
  content: string;

  @Column('simple-json', { nullable: true })
  questions: any;

  @Column('simple-json', { nullable: true })
  answers: any;

  @Column('int', { default: 15 })
  estimatedMinutes: number;

  @CreateDateColumn()
  createdAt: Date;
}
