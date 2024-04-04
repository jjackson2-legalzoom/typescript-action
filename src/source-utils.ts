// Functions for interacting with source code

import { existsSync, readFileSync } from 'fs';
import * as path from 'path';
import { SemVer, parse } from 'semver';

/**
 * workspaceDir is the path to the directory containing the `package.json`
 */
export function getVersion(workspaceDir: string): SemVer {
  const pathToPackage = path.join(workspaceDir, 'package.json');
  if (!existsSync(pathToPackage)) {
    throw new Error("Could not find package.json")
  }
  const data = JSON.parse(readFileSync(pathToPackage).toString())
  try {
    const versionString = data['version'].toString();
    const parsed = parse(versionString);
    if (parsed != undefined) {
      return parsed;
    } else {
      const errorMessage = `Could not parse "${versionString}" to a semver`;
      console.log(errorMessage);
      throw new Error(errorMessage);
    }
  } catch {
    console.log('Error while reading version from following json:');
    console.log(data);
    throw new Error('Error while reading version data');
  }
}