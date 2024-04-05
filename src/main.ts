import * as core from '@actions/core'
import { context } from '@actions/github'
import { Octokit } from 'octokit'
import { updatePullRequest } from './pull-request'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  let octokit
  try {
    octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    })
  } catch {
    const errorMessage = `Failed to create octokit with token ${process.env.GITHUB_TOKEN}`
    console.log(errorMessage)
    throw new Error(errorMessage)
  }

  try {
    const invocationType = core.getInput('invocation-type')

    console.log("Here's a bunch of debug logging")
    console.log(context.action)
    console.log(context.repo)
    console.log(context.payload)
    console.log(context.eventName)
    console.log(context.ref)
    console.log(invocationType)
    switch (invocationType) {
      case 'pull_request':
        updatePullRequest(octokit, {
          owner: 'devops',
          pull_number: 42,
          repo: 'auto-comment-testing-2'
        })
        break
      case 'push':
        console.log(`"push" is not yet supported`)
        return
      default:
        throw new Error(
          `Called with unsupported invocation-type ${invocationType}`
        )
    }

    // If we end up wanting to set a tag, we can do so here
    // (Though maybe that's not a good idea? Since that only makes sense when this is called for a `main` update rather
    // than for a PR update?)
    // core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
