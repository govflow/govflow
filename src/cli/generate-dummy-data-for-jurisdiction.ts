#! /usr/bin/env node
import 'reflect-metadata';
import { createApp } from '..';
import { run } from '../tools/dummy-data-for-jurisdiction';

(async () => {
  const app = await createApp();
  run(app);
})();
