import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from 'typeorm';
@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number | undefined;

  @Column({ type: 'varchar' })
  name: string | undefined;

  @Column({ type: 'varchar' })
  description: string | undefined;
}
