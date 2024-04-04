import { SemVer } from 'semver';
import * as su from '../src/source-utils';

// `expectedOutput` is absent if we expect an Exception
type TestCase = {name: string; expectedOutput?: string}

test.each<TestCase>([
  {
    name: "basic",
    expectedOutput: "1.0.0"
  },
  {
    name: "fleshed-out",
    expectedOutput: "1.0.2"
  },
  {
    name: "malformed"
  },
  {
    name: "no-version"
  },
  {
    name: 'unparsable-version'
  },
  {
    name: "does-not-exist"
  }
])("Test case $name should give output $expectedOutput",
({ name, expectedOutput }) => {
  if (expectedOutput != undefined) {
    expect(
      returnVersionFromTestCaseName(name).toString()
    ).toEqual(expectedOutput);
  } else {
    // Expect an Exception
    expect(() => returnVersionFromTestCaseName(name)).toThrow()
  }
});

function returnVersionFromTestCaseName(testCaseName: string): SemVer {
  return su.getVersion(`__tests__/source_utils_test_data/${testCaseName}`);
}