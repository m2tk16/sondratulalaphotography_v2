import * as api4593058b from './api/api4593058b/resource';
import * as apid5657c10 from './api/apid5657c10/resource';
import * as auth from './auth/resource';
import * as sondratulalaphotogradcd4b5ed from './function/sondratulalaphotogradcd4b5ed/resource';
import * as storage from './storage/resource';
import { defineBackend } from '@aws-amplify/backend';
import { Tags } from 'aws-cdk-lib';

const backend = defineBackend({
  auth: auth.auth,
  sondratulalaphotogradcd4b5ed: sondratulalaphotogradcd4b5ed.sondratulalaphotogradcd4b5ed,
  storage: storage.storage,
});

export type Backend = typeof backend;

api4593058b.defineApi4593058bApi(backend);
apid5657c10.defineApid5657c10Api(backend);

auth.applyEscapeHatches(backend);
sondratulalaphotogradcd4b5ed.applyEscapeHatches(backend);
storage.applyEscapeHatches(backend);
sondratulalaphotogradcd4b5ed.configureRuntimeResources(backend);

export function postRefactor() {
  storage.postRefactor(backend);
  Tags.of(backend.stack).add('gen2-migration/post-refactor', 'true');
}

// Uncomment after refactor
// postRefactor();
