import type ExampleService from '../interfaces/ExampleService.js';

class ExampleServiceImpl implements ExampleService {
  getExampleMessage(): string {
    return 'This is an example message from ExampleServiceImpl';
  }
}

export default ExampleServiceImpl;
