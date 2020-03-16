import { Column, Entity, ObjectID } from 'typeorm';
import { Base } from './base';

@Entity()
export class Option extends Base{
  @Column()
  questionId: ObjectID;
  @Column()
  title: string;
  @Column()
  answer: boolean;
}