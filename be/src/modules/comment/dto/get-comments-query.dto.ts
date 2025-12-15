import { IsOptional, IsNumber, IsString, IsIn, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetCommentsQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsIn(['newest', 'oldest'])
  sort?: 'newest' | 'oldest' = 'newest';

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  replyLimit?: number = 3;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  afterId?: number;
}
