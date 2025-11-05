import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { timeStamp } from "console";
import { map, Observable } from "rxjs";


@Injectable()
export class ResponseInterceptor implements NestInterceptor{
      intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
             const response = context.switchToHttp().getResponse();
            return next.handle().pipe(map((data) => {

                return {
                    success: true,
                    message: data?.message || "Request successfull",
                    data: data?.data || null,
                    statusCode: response.statusCode || 200,
                    timeStamp: Date.now()
                }
            }))
             
        }
}