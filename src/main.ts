import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadSchema } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { OpenAPI, useSofa } from 'sofa-api';
import * as swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from './swagger.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const schema = await loadSchema('./src/**/*.graphql', {
    loaders: [new GraphQLFileLoader()],
  });
  const openApi = OpenAPI({
    schema,
    info: {
      title: 'Example API',
      version: '3.0.0',
    },
  });
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

  openApi.save('./swagger.yml');
  openApi.save('./swagger.json');
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  await app.listen(3000);
}

bootstrap();
