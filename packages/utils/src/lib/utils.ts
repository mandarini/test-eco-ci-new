import { getPublishedVersion } from './get-env-info';
import { execSync } from 'child_process';
import {
  detectPackageManager,
  getPackageManagerCommand,
  output,
} from '@nx/devkit';
import { tmpProjPath } from '@nx/plugin/testing';

let projName: string;

export function runCreateWorkspace(
  name: string,
  {
    preset,
    appName,
    style,
    base,
    packageManager,
    extraArgs,
    ci,
    cwd = tmpProjPath(),
    bundler,
    routing,
    standaloneApi,
    nextAppDir,
  }: {
    preset: string;
    appName?: string;
    style?: string;
    base?: string;
    packageManager?: 'npm' | 'yarn' | 'pnpm';
    extraArgs?: string;
    ci?: 'azure' | 'github' | 'circleci';
    useDetectedPm?: boolean;
    cwd?: string;
    bundler?: 'webpack' | 'vite';
    standaloneApi?: boolean;
    routing?: boolean;
    nextAppDir?: boolean;
  }
): { output: string; cwd: string } {
  projName = name;

  const pm = getPackageManagerCommand(packageManager);

  let command = `npx create-nx-workspace@${getPublishedVersion()} ${name} --preset=${preset} --no-nxCloud --no-interactive`;
  if (appName) {
    command += ` --appName=${appName}`;
  }
  if (style) {
    command += ` --style=${style}`;
  }
  if (ci) {
    command += ` --ci=${ci}`;
  }

  if (bundler) {
    command += ` --bundler=${bundler}`;
  }

  if (nextAppDir) {
    command += ` --nextAppDir=${nextAppDir}`;
  }

  if (standaloneApi !== undefined) {
    command += ` --standaloneApi=${standaloneApi}`;
  }

  if (routing !== undefined) {
    command += ` --routing=${routing}`;
  }

  if (base) {
    command += ` --defaultBase="${base}"`;
  }

  command += ` --package-manager=${packageManager ?? pm}`;

  if (extraArgs) {
    command += ` ${extraArgs}`;
  }

  try {
    const create = execSync(`${command} --verbose`, {
      cwd,
      stdio: 'pipe',
      env: { CI: 'true', ...process.env },
      encoding: 'utf-8',
    });

    output.log({
      title: `Command: ${command}`,
      bodyLines: [create as string, `CWD: ${cwd}`],
      color: 'green',
    });

    return { output: create, cwd };
  } catch (e) {
    console.log('cwd', cwd);
    console.error(`Original command: ${command}`, e);
    throw e;
  }
}

export function packageInstall(pkg: string, version = getPublishedVersion()) {
  const cwd = tmpProjPath() + '/' + projName;
  const pm = getPackageManagerCommand(detectPackageManager(cwd));
  const pkgsWithVersions = pkg
    .split(' ')
    .map((pgk) => `${pgk}@${version}`)
    .join(' ');

  const command = `${pm.addDev} ${pkgsWithVersions}`;
  try {
    const install = execSync(command, {
      cwd,
      stdio: 'inherit',
      env: process.env,
      encoding: 'utf-8',
    });

    return install;
  } catch (e) {
    console.error(`Original command: ${command}`, `${e}`);
    throw e;
  }
}
