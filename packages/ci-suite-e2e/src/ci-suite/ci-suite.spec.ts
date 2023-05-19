import { packageInstall, runCreateWorkspace } from '@nx-ecosystem-ci/utils';
import {
  checkFilesExist,
  listFiles,
  runCommandAsync,
  tmpProjPath,
  uniq,
  updateFile,
} from '@nx/plugin/testing';
import { detectPackageManager } from '@nx/devkit';

const wsName = uniq('rspack');

process.env.PUBLISHED_VERSION = 'next';

describe('CLI tests', () => {
  beforeAll(() => {
    runCreateWorkspace(wsName, {
      preset: 'apps',
      style: 'css',
      packageManager: detectPackageManager(),
    });
    const workspaceDir = tmpProjPath(wsName);
    console.log('Created new workspace in: ', workspaceDir);
    packageInstall('@nx/rspack', 'latest');
  });
  it('should print a message', async () => {
    const project = uniq('myapp');
    await runCommandAsync(
      `nx generate @nx/rspack:app ${project} --framework=react --unitTestRunner=jest --e2eTestRunner=cypress`,
      {
        cwd: tmpProjPath(wsName),
      }
    );
    let result = await runCommandAsync(`nx build ${project}`, {
      env: { NODE_ENV: 'production' },
    });
    expect(result.stdout).toContain('Successfully ran target build');
    // Make sure expected files are present.
    expect(listFiles(`dist/${project}`)).toHaveLength(4);

    result = await runCommandAsync(`nx test ${project}`);
    expect(result.stdout).toContain('Successfully ran target test');

    result = await runCommandAsync(`nx e2e e2e`);
    expect(result.stdout).toContain('Successfully ran target e2e');

    // Update app and make sure previous dist files are not present.
    updateFile(`src/app/app.tsx`, (content) => {
      return `${content}\nconsole.log('hello');
    `;
    });
    result = await runCommandAsync(`build ${project}`, {
      env: { NODE_ENV: 'production' },
    });
    expect(result.stdout).toContain('Successfully ran target build');
    expect(listFiles(`dist/${project}`)).toHaveLength(4); // same length as before

    // Generate a new app and check that the files are correct
    const app2 = uniq('app2');
    await runCommandAsync(
      `nx generate @nx/rspack:app ${app2} --framework=react --unitTestRunner=jest --e2eTestRunner=cypress --style=css`
    );
    checkFilesExist(`${app2}/project.json`, `${app2}-e2e/project.json`);
    result = await runCommandAsync(`nx build ${app2}`, {
      env: { NODE_ENV: 'production' },
    });
    expect(result.stdout).toContain('Successfully ran target build');
    // Make sure expected files are present.
    expect(listFiles(`dist/${app2}`)).toHaveLength(4);

    result = await runCommandAsync(`nx test ${app2}`);
    expect(result.stdout).toContain('Successfully ran target test');

    result = await runCommandAsync(`nx e2e ${app2}-e2e`);
    expect(result.stdout).toContain('Successfully ran target e2e');
  }, 200_000);
});
