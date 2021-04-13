import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestModule } from './test/test.module';
import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    TestModule,
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), './src/schema.graphql'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
