import { CallHandler, ExecutionContext, Logger, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";



export class LoggingInterceptor implements NestInterceptor {
        private logger =  new Logger();
        intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
              const request = context.switchToHttp().getRequest();
              const response = context.switchToHttp().getResponse();

              const {method, url} = request;
              const startAt = Date.now();  
            
             return next.handle().pipe(tap(() => {
                 const statusCode = response.statusCode;
                 const duration =  Date.now() - startAt;
                 this.logger.log(`${method} ${url} - Status:${statusCode}-duration:${duration}ms`);
            }))
        }



}