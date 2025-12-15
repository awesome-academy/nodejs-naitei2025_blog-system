import { MaxLength } from "class-validator";
import { StringRequired } from "src/common/decorators/validate.decorator";

export class CreateTagDto {
    @StringRequired('Name')
    @MaxLength(50, { message: 'Tag name is too long. Maximum length is $constraint1 characters.' })
    name: string;
}
