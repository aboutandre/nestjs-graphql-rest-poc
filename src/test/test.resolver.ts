import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class TestResolver {
  @Query(() => String)
  async hello() {
    return 'Hello world?!';
  }
}
