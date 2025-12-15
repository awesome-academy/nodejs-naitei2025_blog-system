import {
  StringRequired,
  LengthDistance,
} from 'src/common/decorators/validate.decorator';

export class CreateCommentDto {
  @StringRequired('body')
  @LengthDistance(1, 500, 'body')
  body: string;
}
