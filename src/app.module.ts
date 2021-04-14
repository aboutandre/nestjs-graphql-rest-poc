import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestModule } from './test/test.module';
import { GraphQLModule, GraphQLSchemaHost } from '@nestjs/graphql';
import { HttpAdapterHost } from '@nestjs/core';
import { Application } from 'express';
import { OpenAPI, useSofa } from 'sofa-api';
import * as swaggerUi from 'swagger-ui-express';

@Module({
  imports: [
    TestModule,
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    @Inject(GraphQLSchemaHost) private readonly schemaHost: GraphQLSchemaHost,
    @Inject(HttpAdapterHost) private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  onModuleInit(): void {
    if (!this.httpAdapterHost) {
      return;
    }

    const { httpAdapter } = this.httpAdapterHost;
    const app: Application = httpAdapter.getInstance();
    const { schema } = this.schemaHost;
    const openApi = OpenAPI({
      schema,
      info: {
        title: 'StudyContext REST API',
        version: '1.0.0',
      },
    });

    // convert GraphQL API to REST using SOFA
    app.use(
      '/api',
      useSofa({
        schema,
        basePath: '/api',
        onRoute(info) {
          openApi.addRoute(info, {
            basePath: '/api',
          });
        },
      }),
    );

    // add Swagger page for REST API
    const openApiDefinitions = openApi.get();
    openApiDefinitions.paths['/api/add-project-file'] = '/api/add-project-file';

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDefinitions));
  }
}
