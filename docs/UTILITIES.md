# Utilities Documentation

## Cache System

### Using Cache

```typescript
import { Cache, getCachedOrFetch } from './utils/cache.js';

// Simple usage
const data = await getCachedOrFetch('my-key', async () => {
  // Heavy operation
  return await fetchDataFromAPI();
});

// Advanced usage
const cache = Cache.getInstance();

// Save
await cache.set('user-data', userData, '1.0');

// Read
const cached = await cache.get('user-data', '1.0');

// Invalidate
await cache.invalidate('user-data');

// Clear all
await cache.clear();
```

### Cache Features
- **Memory cache** for fast access
- **Disk cache** for persistence
- **TTL**: 24 hours (configurable)
- **Versioning**: Version support
- **Automatic cleanup**: Auto-removal of expired cache

## Performance Monitoring

### Using Performance Monitor

```typescript
import { PerformanceMonitor, measure, measurePerformance } from './utils/performance.js';

// Method 1: Manual timing
const monitor = PerformanceMonitor.getInstance();
monitor.start('my-operation');
// ... operation
monitor.end('my-operation');

// Method 2: Helper function
await measure('my-async-operation', async () => {
  await doSomethingHeavy();
});

// Method 3: Decorator (for methods)
class MyService {
  @measurePerformance
  async heavyOperation() {
    // This method is automatically measured
  }
}

// Show summary
monitor.summary();

// Get metrics
const metrics = monitor.getMetrics();
console.log(metrics);
```

### Use Cases
- Measure operation timing
- Identify bottlenecks
- Optimize performance
- Debug performance issues

## Best Practices

### Cache
```typescript
// ✅ Good: Use version for invalidation
await cache.set('data', myData, '2.0');

// ✅ Good: Use getCachedOrFetch
const result = await getCachedOrFetch('expensive-op', fetchData);

// ❌ Bad: Forgetting version
await cache.set('data', myData); // default version '1.0'
```

### Performance
```typescript
// ✅ Good: Measure heavy operations
await measure('database-query', () => db.query());

// ✅ Good: Show summary in development
if (process.env.NODE_ENV === 'development') {
  monitor.summary();
}

// ❌ Bad: Measuring trivial operations
monitor.start('simple-addition');
const result = 1 + 1;
monitor.end('simple-addition'); // overhead exceeds benefit
```

## Integration Example

```typescript
import { getCachedOrFetch } from './utils/cache.js';
import { measure } from './utils/performance.js';
import { logger } from './logger.js';

async function fetchUserData(userId: string) {
  return await getCachedOrFetch(
    `user-${userId}`,
    async () => {
      return await measure('fetch-user-from-api', async () => {
        logger.debug(`Fetching user ${userId} from API`);
        const response = await fetch(`/api/users/${userId}`);
        return await response.json();
      });
    },
    '1.0'
  );
}

// Usage
const user = await fetchUserData('123');
// First time: Fetches from API and caches
// Second time: Reads from cache (fast)
```

## Environment Variables

```bash
# Enable debug mode to see cache hits/misses
DEBUG=rapidkit:cache npm run dev

# Enable performance logging
DEBUG=rapidkit:perf npm run dev

# Enable all
DEBUG=rapidkit:* npm run dev
```

## Testing

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { Cache } from './utils/cache.js';

describe('Cache', () => {
  beforeEach(async () => {
    await Cache.getInstance().clear();
  });

  it('should cache and retrieve data', async () => {
    const cache = Cache.getInstance();
    await cache.set('test', { value: 42 });
    const result = await cache.get('test');
    expect(result).toEqual({ value: 42 });
  });

  it('should invalidate expired cache', async () => {
    // Test with mock Date.now()
  });
});
```

## Migration Guide

If you have existing code that you want to add caching to:

```typescript
// Before
async function loadTemplates() {
  const files = await fs.readdir(templateDir);
  return files.map(parseTemplate);
}

// After
async function loadTemplates() {
  return await getCachedOrFetch('templates', async () => {
    const files = await fs.readdir(templateDir);
    return files.map(parseTemplate);
  }, '1.0');
}
```

## Troubleshooting

### Cache not working
```bash
# Check cache location
ls -la ~/.rapidkit/cache/

# Clear cache manually
rm -rf ~/.rapidkit/cache/

# Check permissions
chmod -R 755 ~/.rapidkit/
```

### Incorrect performance metrics
```bash
# Make sure you're in debug mode
export DEBUG=rapidkit:perf
npm run dev

# Check memory usage
node --expose-gc --max-old-space-size=4096 dist/index.js
```
