import { Octokit } from 'octokit'
import * as path from 'path'
import { RepoId } from './types'
import { SemVer, parse } from 'semver'

export async function getSemVerOfBranch(
  octokit: Octokit,
  repoId: RepoId,
  branchName: string,
  // If your package.json is not in the root
  dir?: string
): Promise<SemVer> {
  const packageJsonContent = await octokit.rest.repos.getContent({
    path: path.join(dir ?? '.', 'package.json'),
    ref: branchName,
    ...repoId
  })
  return parsePackageJsonAndReturnVersion(packageJsonContent)
}

// `packageJson` is "just" a JsonObject, so cannot assign a type to it (...right? Maybe there is a way?)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsePackageJsonAndReturnVersion(packageJson: any): SemVer {
  const versionString = packageJson['version'].toString()
  const parsed = parse(versionString)
  if (parsed != null) {
    return parsed
  } else {
    const errorMessage = `Could not parse "${versionString}" to a semver`
    console.log(errorMessage)
    throw new Error(errorMessage)
  }
}
