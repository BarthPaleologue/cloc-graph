# Tests for cloc-graph

This directory contains all the automated tests for the cloc-graph project.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

## Test Structure

The test directory structure mirrors the source directory structure:

```
src/
└── __tests__/
    ├── utils/                  # Tests for utility functions
    │   ├── dateUtils.test.ts   # Tests for date utilities
    │   ├── errorHandler.test.ts# Tests for error handling
    │   ├── logger.test.ts      # Tests for logging system
    │   └── sampling.test.ts    # Tests for sampling algorithms
    └── services/               # Tests for core services (to be added)
```

## Writing Tests

When writing new tests, please follow these guidelines:

1. **Name your test files** with the same name as the module being tested, but with `.test.ts` suffix
2. **Use descriptive test names** that explain what is being tested
3. **Follow the AAA pattern**:
   - **Arrange**: Set up the test preconditions
   - **Act**: Call the code being tested
   - **Assert**: Verify the expected behavior
4. **Mock external dependencies** like filesystem, Git operations, etc.
5. **Clean up after tests** that create temporary files or modify state

## Test Coverage

The project aims to maintain high test coverage. The coverage report is available in the `coverage/` directory after running tests with the coverage option.