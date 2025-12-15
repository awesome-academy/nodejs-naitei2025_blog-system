import {
  FIND_MANY_ARTICLES_QUERY_DTO_DEFAULT_LIMIT,
  FIND_MANY_ARTICLES_QUERY_DTO_DEFAULT_OFFSET,
} from 'src/common/constants/article.constant';
import {
  NumberOptional,
  StringOptional,
} from 'src/common/decorators/validate.decorator';

export class FindManyArticlesQueryDto {
  @StringOptional('Tag')
  tag: string;

  @StringOptional('Author')
  author: string;

  @StringOptional('Favorited')
  favorited: string;

  @NumberOptional('Limit')
  limit: number = FIND_MANY_ARTICLES_QUERY_DTO_DEFAULT_LIMIT;

  @NumberOptional('Offset')
  offset: number = FIND_MANY_ARTICLES_QUERY_DTO_DEFAULT_OFFSET;
}
