# Testing Documentation

## Overview
This project includes comprehensive testing for all modules using Jest for unit tests and Supertest for E2E tests.

## Test Structure

### Unit Tests
Unit tests are located next to the source files with `.spec.ts` extension:

```
src/
├── category/
│   └── category.service.spec.ts
├── unit/
│   └── unit.service.spec.ts
├── item/
│   └── item.service.spec.ts
└── sale/
    └── sale.service.spec.ts
```

### E2E Tests
End-to-end tests are located in the `test/` directory:

```
test/
├── app.e2e-spec.ts
└── items-sales.e2e-spec.ts
```

## Running Tests

### Run All Unit Tests
```bash
pnpm test
```

### Run Tests in Watch Mode
```bash
pnpm test:watch
```

### Run Tests with Coverage
```bash
pnpm test:cov
```

### Run E2E Tests
```bash
pnpm test:e2e
```

### Run Specific Test File
```bash
pnpm test category.service.spec
```

### Debug Tests
```bash
pnpm test:debug
```

## Test Coverage

### Category Module Tests
- ✅ Create category
- ✅ Find all categories
- ✅ Find category by ID
- ✅ Update category
- ✅ Delete category

### Unit Module Tests
- ✅ Create unit
- ✅ Find all units
- ✅ Find unit by ID
- ✅ Update unit
- ✅ Delete unit

### Item Module Tests
- ✅ Create item
- ✅ Find all items with relations
- ✅ Find item by ID
- ✅ Find item by barcode
- ✅ Update item
- ✅ Update item stock
- ✅ Delete item

### Sale Module Tests
- ✅ Create sale transaction
- ✅ Validate stock before sale
- ✅ Auto-generate invoice number
- ✅ Update stock after sale
- ✅ Transaction rollback on error
- ✅ Find all sales
- ✅ Find sale by ID
- ✅ Find sale by invoice number
- ✅ Generate sales report

## E2E Test Scenarios

### Authentication Flow
1. Login as admin
2. Get JWT token
3. Use token for authenticated requests

### Category Flow
1. Create new category
2. Get all categories
3. Get category by ID
4. Update category
5. Delete category

### Unit Flow
1. Create new unit
2. Get all units
3. Get unit by ID
4. Update unit
5. Delete unit

### Item Flow
1. Create new item with category & unit
2. Get all items with relations
3. Find item by barcode
4. Update item stock
5. Delete item

### Sale Flow
1. Create sale transaction
2. Validate stock deduction
3. Check invoice number format
4. Get sale by ID
5. Find sale by invoice number
6. Generate sales report by date range

## Test Database

E2E tests use the same database configuration as development. Make sure to:

1. Have PostgreSQL running
2. Database is properly configured in `.env`
3. Run migrations before E2E tests:
   ```bash
   pnpm migration:run
   pnpm seed
   ```

## Mock Data

Unit tests use mock data and repositories:
- No real database connection
- Fast execution
- Isolated testing

E2E tests use real database:
- Full integration testing
- Real data persistence
- Cleanup after tests

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:cov
      - run: pnpm test:e2e
```

## Best Practices

1. **Write Tests First (TDD)**
   - Write failing test
   - Implement feature
   - Make test pass

2. **Test Coverage**
   - Aim for >80% coverage
   - Focus on business logic
   - Test edge cases

3. **Mock External Dependencies**
   - Database in unit tests
   - External APIs
   - Time-dependent operations

4. **Clean Test Data**
   - Clean up after E2E tests
   - Use transactions when possible
   - Isolate test data

5. **Descriptive Test Names**
   ```typescript
   it('should throw error if item stock insufficient', async () => {
     // ...
   });
   ```

6. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should create a new category', async () => {
     // Arrange
     const createDto = { code: 'CAT001', name: 'Electronics' };
     
     // Act
     const result = await service.create(createDto);
     
     // Assert
     expect(result.code).toBe('CAT001');
   });
   ```

## Debugging Failed Tests

### View Detailed Error
```bash
pnpm test -- --verbose
```

### Run Single Test
```bash
pnpm test -- -t "should create a new category"
```

### Debug with VSCode
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Test Reports

### Coverage Report
After running `pnpm test:cov`, view coverage at:
```
coverage/lcov-report/index.html
```

### Jest HTML Reporter (Optional)
```bash
pnpm add -D jest-html-reporter
```

Add to package.json:
```json
{
  "jest": {
    "reporters": [
      "default",
      ["jest-html-reporter", {
        "pageTitle": "ERP Backend Test Report",
        "outputPath": "test-report.html"
      }]
    ]
  }
}
```

## Common Issues

### Issue: Tests timeout
**Solution**: Increase timeout
```typescript
jest.setTimeout(30000);
```

### Issue: Database connection error
**Solution**: Check `.env` and database running
```bash
docker-compose up -d postgres
```

### Issue: Port already in use
**Solution**: Kill process or use different port
```bash
lsof -ti:3000 | xargs kill -9
```

## Summary

- **Unit Tests**: 40+ test cases for services
- **E2E Tests**: Full workflow testing
- **Coverage**: Business logic thoroughly tested
- **Fast Execution**: Unit tests <5s, E2E tests <30s
- **CI Ready**: Can be integrated with GitHub Actions

Run all tests before deployment:
```bash
pnpm test && pnpm test:e2e
```
