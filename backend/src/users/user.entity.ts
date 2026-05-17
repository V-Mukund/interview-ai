import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  profilePic: string;

  @Column({ nullable: true })
  dateOfBirth: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;
}
