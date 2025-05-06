import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from 'typeorm';
@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number | undefined;

  // 消息内容
  @Column({ type: 'varchar' })
  content: string | undefined;

  // 发送该消息的时间
  @Column({ type: 'varchar' })
  time: string | undefined;

  // 发送该消息的角色 0：机器人；1：用户
  @Column({ type: 'varchar' })
  role: number | string | undefined;
}
