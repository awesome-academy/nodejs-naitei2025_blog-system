import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  ARTICLE_BODY_MAX_LENGTH,
  ARTICLE_COVER_IMAGE_MAX_LENGTH,
  ARTICLE_DESCRIPTION_MAX_LENGTH,
  ARTICLE_MAX_LENGTH,
} from 'src/common/constants/article.constant';
import { StringRequired } from 'src/common/decorators/validate.decorator';

export class CreateArticleDto {
  @StringRequired('Title')
  @MaxLength(ARTICLE_MAX_LENGTH, {
    message: `Title must be shorter than or equal to ${ARTICLE_MAX_LENGTH} characters`,
  })
  title: string;

  @StringRequired('Description')
  @MaxLength(ARTICLE_DESCRIPTION_MAX_LENGTH, {
    message: `Description must be shorter than or equal to ${ARTICLE_DESCRIPTION_MAX_LENGTH} characters`,
  })
  description: string;

  @StringRequired('Body')
  @MaxLength(ARTICLE_BODY_MAX_LENGTH, {
    message: `Body must be shorter than or equal to ${ARTICLE_BODY_MAX_LENGTH} characters`,
  })
  body: string;

  @StringRequired('Cover image')
  @MaxLength(ARTICLE_COVER_IMAGE_MAX_LENGTH, {
    message: `Cover image must be shorter than or equal to ${ARTICLE_COVER_IMAGE_MAX_LENGTH} characters`,
  })
  cover_image: string;

  @IsOptional()
  @IsArray({ message: 'Tag list must be an array of strings' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tagList?: string[];
}
