import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async findAll() {
    const tags = await this.tagService.findAll();
    if (!tags || tags.length === 0) {
      return {
        message: 'No tags found',
      };
    }
    const result = tags.map((tag) => tag.name);

    return {
      message: 'Tags retrieved successfully',
      data: result,
    };
  }
}
