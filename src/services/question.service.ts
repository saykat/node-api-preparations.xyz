import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../models/entities/question';
import { Option } from '../models/entities/option';
import { QuestionRequestModel } from '../models/request-models/question.request.model';
import { CategoryMapRequestModel } from '../models/request-models/category-map.request.model';
import { CategoryMapping } from '../models/entities/category-mapping';
import { BaseService } from './base.service';


@Injectable()
export class QuestionService extends BaseService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
    @InjectRepository(CategoryMapping)
    private readonly categoryMappingRepository: Repository<CategoryMapping>,
  ) {
    super();
  }

  async save(question: QuestionRequestModel): Promise<Question>{
    const newQuestion = new Question();
    newQuestion.title = question.title;
    newQuestion.subject = question.subject;
    newQuestion.chapter = question.chapter;
    newQuestion.options = question.options;
    newQuestion.categories = question.categories;
    this.genFootprint<Question>(newQuestion);
    return await  this.questionRepository.save(newQuestion);
  }

  async saveOptions(options: Option[], questionId: any): Promise<Option[]>{
    const newOptions: Option[] = [];
    options.forEach((option) => {
      if(option.title !== undefined){
        const newOption = new Option();
        newOption.title = option.title;
        newOption.answer = option.answer;
        newOption.title = option.title;
        newOption.questionId = questionId;
        this.genFootprint<Option>(newOption);
        newOptions.push(newOption);
      }
    });
    return await  this.optionRepository.save(newOptions)
  }

  async mapCategories(categories: CategoryMapRequestModel[], questionId: any) {
    const categoryMaps = [];
    categories.forEach( category =>{
      const categoryMap = new CategoryMapping();
      categoryMap.categoryId = category.id;
      categoryMap.questionId = questionId;
      this.genFootprint<CategoryMapping>(categoryMap)
      categoryMaps.push(categoryMap);
    })
    return await this.categoryMappingRepository.save(categoryMaps);
  }

  async getQuestion(page: number, category: string, chapter: string, subject: string): Promise<Question[]> {
    let searchchapter = new RegExp('.*.*', "i");
    let searchsubject = new RegExp('.*.*', "i");

    if(chapter !== "default"){
      searchchapter = new RegExp('.*' + chapter + '.*', "i");
    }
    if(subject !== "default"){
      searchsubject = new RegExp('.*' + subject + '.*', "i");
    }

    return await this.questionRepository.find({
      where: {"categories.title": category, "chapter.id": searchchapter, "subject.id": searchsubject},
      skip: (page*30),
      take: 30
    });
  }

}
