import { asClass, createContainer, InjectionMode, Lifetime } from 'awilix';
import { ExampleServiceImpl } from '../services/index.js';

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  // Services Example
  //prisma: asValue(prisma),
  //guestRepository: asClass(GuestRepositoryPostgres, {
  //	lifetime: Lifetime.SINGLETON
  //})
  exampleService: asClass(ExampleServiceImpl, {
    lifetime: Lifetime.SINGLETON,
  }),
});

// This is how to use the container
// const guestRepository = container.resolve<GuestRepository>('guestRepository');
export default container;
