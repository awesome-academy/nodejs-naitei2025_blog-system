import { StringRequired } from 'src/common/decorators/validate.decorator';

export class LogInDto {
  @StringRequired('Email')
  email: string;

  @StringRequired('Password')
  password: string;
}