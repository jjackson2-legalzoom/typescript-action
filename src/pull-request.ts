import { Octokit } from 'octokit'
import {
  BumpType,
  MAJOR_BUMP_TYPE,
  MINOR_BUMP_TYPE,
  PATCH_BUMP_TYPE,
  PullRequestId,
  RepoId
} from './types'
import { getSemVerOfBranch } from './semver'
// I have no idea why this one package cannot get resolved by eslint - but the type is available in code, so ¯\_(ツ)_/¯
// eslint-disable-next-line import/no-unresolved
import { components } from '@octokit/openapi-types'
import { SemVer } from 'semver'

type PullRequestInfo = components['schemas']['pull-request']

export async function updatePullRequest(
  octokit: Octokit,
  prId: PullRequestId
): Promise<void> {
  const repo = await octokit.rest.repos.get({ ...prId })
  const defaultBranch = repo.data.default_branch

  const pr = (await octokit.rest.pulls.get({ ...prId })).data
  // TODO - check that this actually means what I think it means!
  // (or should it be `ref`?)
  const targetBranch = pr.base.label
  if (targetBranch !== defaultBranch) {
    // Do nothing. We only version-bump for Pull Requests that are targeting the default branch.
    return
  }

  // Note that there is no need to check for "was the latest commit on this PR by this action", because this operation
  // is idempotent and will not loop:
  // * Either the latest commit on the PR has the correct version, so this action will terminate without making another
  //     commit (and so the action will not get called again)
  // * Or the latest commit does _not_ have the correct version, in which case the action will make a commit to set the
  //     correct version, thus bringing us into the previous state.

  const targetBranchVersion = await getSemVerOfBranch(
    octokit,
    prId as RepoId,
    defaultBranch
  )
  const bumpType = getBumpTypeOfPr(pr)
  const bumpedVersion = targetBranchVersion.inc(bumpType)

  // If we really care about latency, we could parallelize this with some of the calls above.
  // (personally I'd rather have a PR test run a second or so slower than have to deal with TypeScript's async model)
  const currentVersion = await getSemVerOfBranch(octokit, prId, pr.head.label)
  if (currentVersion !== bumpedVersion) {
    await makeCommitWithNewVersion(prId, bumpedVersion)
  }
}

function getBumpTypeOfPr(pr: PullRequestInfo): BumpType {
  // Prioritize labels because they are more "deliberate" - someone might include the string "MAJOR" in their PR message
  // without actually intending it to be used by this flow.
  for (const label of pr.labels) {
    switch (label.name) {
      case 'MAJOR':
        return MAJOR_BUMP_TYPE
      case 'MINOR':
        return MINOR_BUMP_TYPE
      case 'PATCH':
        return PATCH_BUMP_TYPE
      default:
        continue
    }
  }

  // Later versions of this action might allow for customization of the keywords, but we'll stick to the obvious
  // options for now.
  const pr_message = pr.body
  if (pr_message?.includes('MAJOR')) {
    return MAJOR_BUMP_TYPE
  }
  if (pr_message?.includes('MINOR')) {
    return MINOR_BUMP_TYPE
  }
  if (pr_message?.includes('PATCH')) {
    return PATCH_BUMP_TYPE
  }

  // Default to "Major" because that has the lowest chance of causing unintentional impact if accidentally released.
  return MAJOR_BUMP_TYPE
}

async function makeCommitWithNewVersion(
  prId: PullRequestId,
  bumpedVersion: SemVer
): Promise<void> {
  console.log(
    `Not actually doing anything right now, but when fully implemented would bump ${prId} to ${bumpedVersion}`
  )
}
