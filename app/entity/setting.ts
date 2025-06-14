import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany} from 'typeorm';
import {Message} from "./message";

// 角色设定
@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id: number | undefined;

  // 角色设定名称
  @Column({ type: 'varchar' })
  name: string | undefined;

  // 角色设定
  @Column({ type: 'varchar' })
  character_setting: string | undefined;

  // 角色描述
  @Column({ type: 'varchar' })
  description: string | undefined;

  // 回复最大字数限制
  @Column({ type: 'int' })
  max_text_number: number | undefined;

  // 是否默认 0: 不是默认；1：是默认
  @Column({ type: 'int' })
  default: number | undefined;

  // 一对多：一个 Setting 对应多个 Message
  @OneToMany(() => Message, message => message.setting)
  messages: Message[] | undefined;
}
