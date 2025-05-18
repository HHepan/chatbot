import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne} from 'typeorm';
import {Setting} from "./setting";
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

  // 多对一：多个 Message 属于一个 Setting
  @ManyToOne(() => Setting, setting => setting.messages, { onDelete: 'CASCADE' })
  setting: Setting | undefined;
}
