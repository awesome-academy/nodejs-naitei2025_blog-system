import { Expose } from 'class-transformer';

export class LoginResponseDto {
  @Expose()
  username: string;
  @Expose()
  name: string;
  @Expose()
  image: string;
  @Expose()
  token: string;
  @Expose()
  role: string;
}
