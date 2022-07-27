import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';

import { User } from '../../users/entities/User';

export enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

@Entity('statements')
export class Statement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid', { nullable: true })
  sender_id?: string;

  @Column('uuid', { nullable: true })
  receiver_id?: string;

  @ManyToOne(() => User, (user) => user.statements)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, (user) => user.statements, { nullable: true })
  @JoinColumn({ name: 'sender_id' })
  sender?: string;

  @ManyToOne(() => User, (user) => user.statements, { nullable: true })
  @JoinColumn({ name: 'receiver_id' })
  receiver?: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 7, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: OperationType })
  type: OperationType;

  @CreateDateColumn()
  created_at: Date;

  @CreateDateColumn()
  updated_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}
