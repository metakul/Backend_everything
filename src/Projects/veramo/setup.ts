// Core interfaces
import {
    createAgent,
    IDIDManager,
    IResolver,
    IDataStore,
    IDataStoreORM,
    IKeyManager,
    ICredentialPlugin,
    IDataStoreSaveVerifiablePresentationArgs,    
    IDataStoreSaveVerifiableCredentialArgs
  } from '@veramo/core'
  
  // Core identity manager plugin
  import { DIDManager } from '@veramo/did-manager'
  
  // Ethr did identity provider
  import { EthrDIDProvider } from '@veramo/did-provider-ethr'
  
  // Core key manager plugin
  import { KeyManager } from '@veramo/key-manager'
  
  // Custom key management system for RN
  import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'
  
  // W3C Verifiable Credential plugin
  import { CredentialPlugin } from '@veramo/credential-w3c'
  import { CredentialIssuerEIP712 } from '@veramo/credential-eip712'
  
  import { ISelectiveDisclosure, SelectiveDisclosure } from '@veramo/selective-disclosure'


  // Custom resolvers
  import { DIDResolverPlugin } from '@veramo/did-resolver'
  import { Resolver } from 'did-resolver'
  import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
  import { getResolver as webDidResolver } from 'web-did-resolver'
  // Storage plugin using TypeOrm
  import { Entities, KeyStore, DIDStore, PrivateKeyStore, migrations, DataStore, DataStoreORM } from '@veramo/data-store'
  
  // TypeORM is installed with `@veramo/data-store`
  import { DataSource } from 'typeorm'

  // This will be the name for the local sqlite database for demo purposes
const DATABASE_FILE = 'database.sqlite'

// You will need to get a project ID from infura https://www.infura.io
const INFURA_PROJECT_ID = 'ea740c37d7184641a0abfef6d5beea74'

// This will be the secret key for the KMS
const KMS_SECRET_KEY =
  '89d2c6c89c78404d1019d6f39e7a7fe1c37d486d0ef3501619126fa1bfdbf5ba'

  const dbConnection = new DataSource({
    type: 'sqlite',
    database: DATABASE_FILE,
    synchronize: false,
    migrations,
    migrationsRun: true,
    logging: ['error', 'info', 'warn'],
    entities: Entities,
  }).initialize()


  export const agent = createAgent<
  IDIDManager 
  & IKeyManager 
  & IDataStore 
  & IDataStoreORM 
  & IResolver 
  & ICredentialPlugin 
  & IDataStoreSaveVerifiablePresentationArgs 
  & CredentialIssuerEIP712
  & ISelectiveDisclosure
  & IDataStoreSaveVerifiableCredentialArgs
>({
  plugins: [
    new KeyManager({
      store: new KeyStore(dbConnection),
      kms: {
        local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(KMS_SECRET_KEY))),
      },
    }),
    new DIDManager({
      store: new DIDStore(dbConnection),
      defaultProvider: 'did:ethr:mainnet',
      providers: {
        'did:ethr:mainnet': new EthrDIDProvider({
          defaultKms: 'local',
          network: 'mainnet',
          rpcUrl: 'https://mainnet.infura.io/v3/' + INFURA_PROJECT_ID,
        }),
      }
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
        ...webDidResolver(),
      }),
    }),
    new CredentialPlugin(),
    new CredentialIssuerEIP712(),
    new SelectiveDisclosure(),
    new DataStore(dbConnection),
    new DataStoreORM(dbConnection),
  ],
})