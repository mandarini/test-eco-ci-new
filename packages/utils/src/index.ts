import { tmpProjPath } from '@nx/plugin/testing';
import { ensureDirSync } from 'fs-extra';
ensureDirSync(tmpProjPath());
export * from './lib/utils';
export * from './lib/get-env-info';
