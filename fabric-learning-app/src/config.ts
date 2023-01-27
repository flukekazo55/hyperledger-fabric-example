/* การ import ต่างๆ ที่จำเป็นสำหรับการทำงานของโปรแกรม */
import * as grpc from '@grpc/grpc-js';
import { Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import moment from 'moment';
import * as path from 'path';
import { TextDecoder } from 'util';

// ชื่อของ Channel ที่มี Chaincode ของเรา
export const channelName = envOrDefault('CHANNEL_NAME', 'user-contract');
// ชื่อของ chaincode ที่เราต้องการใช้
export const chaincodeName = envOrDefault('CHAINCODE_NAME', 'uat');
export const mspId = envOrDefault('MSP_ID', 'Org1MSP');
// Path to crypto materials.
export const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve(__dirname, '..', '..', '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com'));
// Path to user private key directory.
export const keyDirectoryPath = envOrDefault('KEY_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore'));
// Path to user certificate.
export const certPath = envOrDefault('CERT_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts', 'cert.pem'));
// Path to peer tls certificate.
export const tlsCertPath = envOrDefault('TLS_CERT_PATH', path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt'));
// Gateway peer endpoint.
export const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:7051');
// Gateway peer SSL host name override.
export const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');

export const utf8Decoder = new TextDecoder();
export const userId = moment().format("DDMMYYHHmmss");

/**
 * It creates a new gRPC connection to the peer
 * @returns A new grpc connection to the peer.
 */
export async function newGrpcConnection(): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}
/**
 * It reads the certificate from the file system and returns an object with the MSP ID and the
 * certificate
 * @returns The mspId and credentials are being returned.
 */
export async function newIdentity(): Promise<Identity> {
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}
/**
 * It reads the first file in the `keyDirectoryPath` directory, creates a private key from the file's
 * contents, and returns a signer that uses that private key
 * @returns A new signer object.
 */
export async function newSigner(): Promise<Signer> {
    const files = await fs.readdir(keyDirectoryPath);
    const keyPath = path.resolve(keyDirectoryPath, files[0]);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}
/**
 * If the environment variable exists, return it, otherwise return the default value.
 * @param {string} key - The environment variable name.
 * @param {string} defaultValue - The value to return if the environment variable is not set.
 * @returns The value of the environment variable with the given key, or the default value if the
 * environment variable is not set.
 */
export function envOrDefault(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
}
/**
 * It prints out the values of the variables that were passed in as command line arguments
 */
export async function displayInputParameters(): Promise<void> {
    console.log(`channelName:       ${channelName}`);
    console.log(`chaincodeName:     ${chaincodeName}`);
    console.log(`mspId:             ${mspId}`);
    console.log(`cryptoPath:        ${cryptoPath}`);
    console.log(`keyDirectoryPath:  ${keyDirectoryPath}`);
    console.log(`certPath:          ${certPath}`);
    console.log(`tlsCertPath:       ${tlsCertPath}`);
    console.log(`peerEndpoint:      ${peerEndpoint}`);
    console.log(`peerHostAlias:     ${peerHostAlias}`);
}