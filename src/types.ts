export interface RepoId {
  owner: string
  repo: string
}

export interface PullRequestId extends RepoId {
  pull_number: number
}

// The constant RELEASE_TYPES does exist in the SemVer package, but contains more values than we support
// (But because TypeScript is _so frickin' cool_, by defining this as a Union type of values which are also members of
// `RELEASE_TYPES` constant, these can _also_ be passed anywhere that a `ReleaseType` is expected)
export type BumpType = 'major' | 'minor' | 'patch'
// Sadly TypeScript isn't _quite_ cool enough for us to be able to define these `const`s above the Union Type and then
// use them directly in the definition - but, allowing a Type Definition to refer to anything but literal values seems
// like a recipe for mistakes, anyway, so I can understand that.
export const MAJOR_BUMP_TYPE = 'major'
export const MINOR_BUMP_TYPE = 'minor'
export const PATCH_BUMP_TYPE = 'patch'
