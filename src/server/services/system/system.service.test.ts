import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { faker } from '@faker-js/faker';
import { TipiConfig } from '../../core/TipiConfig';
import { TipiCache } from '../../core/TipiCache';
import { SystemServiceClass } from '.';

const SystemService = new SystemServiceClass();

const server = setupServer();

const cache = new TipiCache('system.service.test');

afterAll(async () => {
  server.close();
  await cache.close();
});

beforeAll(() => {
  server.listen();
});

beforeEach(async () => {
  await TipiConfig.setConfig('demoMode', false);
  await cache.del('latestVersion');
  server.resetHandlers();
});

describe('Test: getVersion', () => {
  it('Should return current version for latest if request fails', async () => {
    server.use(
      http.get('https://api.github.com/*', () => {
        return HttpResponse.json('Error', { status: 500 });
      }),
    );

    const version = await SystemService.getVersion();

    expect(version).toBeDefined();
    expect(version.current).toBeDefined();
    expect(version.latest).toBe(version.current);
  });

  it('Should return cached version', async () => {
    // Arrange
    server.use(
      http.get('https://api.github.com/*', () => {
        return HttpResponse.json({ tag_name: `v${faker.string.numeric(1)}.${faker.string.numeric(1)}.${faker.string.numeric()}` });
      }),
    );

    // Act
    const version = await SystemService.getVersion();
    const version2 = await SystemService.getVersion();

    // Assert
    expect(version).toBeDefined();
    expect(version.current).toBeDefined();

    expect(version2.latest).toBe(version.latest);
    expect(version2.current).toBeDefined();
  });
});
