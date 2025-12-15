import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ClassConstructor<T = any> {
  new (...args: any[]): T;
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: ClassConstructor) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response: any) => {
        // Trường hợp 1: Response có dạng { message, data }
        if (response && response.data) {
          if (!response.data) {
            return response;
          }
          if (response.data.items) {
            return {
              ...response,
              data: {
                ...response.data,
                items: Array.isArray(response.data.items)
                  ? response.data.items.map((item: any) =>
                      plainToInstance(this.dto, item, {
                        excludeExtraneousValues: true,
                      }),
                    )
                  : plainToInstance(this.dto, response.data.items, {
                      excludeExtraneousValues: true,
                    }),
              },
            };
          }
          if (Array.isArray(response.data)) {
            return {
              ...response,
              data: response.data.map((item: any) =>
                plainToInstance(this.dto, item, {
                  excludeExtraneousValues: true,
                }),
              ),
            };
          }
          return {
            ...response,
            data: plainToInstance(this.dto, response.data, {
              excludeExtraneousValues: true,
            }),
          };
        }

        // Trường hợp 2: Response chỉ là data thuần (mảng hoặc object)
        return plainToInstance(this.dto, response, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
