/* การนำเข้าฟังก์ชันที่อยู่ในไฟล์ config.ts เพื่อใช้งานในไฟล์นี้ */
import { connect, Contract } from '@hyperledger/fabric-gateway';
import { chaincodeName, channelName, displayInputParameters, newGrpcConnection, newIdentity, newSigner, userId, utf8Decoder } from './config';

/**
 * It connects to the gateway, gets a network instance representing the channel where the smart
 * contract is deployed, gets the smart contract from the network, initializes a set of asset data on
 * the ledger using the chaincode 'InitLedger' function, returns all the current assets on the ledger,
 * creates a new asset on the ledger, and gets the asset details by userId
 */
async function main(): Promise<void> {
    await displayInputParameters();
    // The gRPC client connection should be shared by all Gateway connections to this endpoint.
    const client = await newGrpcConnection();
    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        // Default timeouts for different gRPC calls
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    });
    try {
        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(channelName);
        // Get the smart contract from the network.
        const contract = network.getContract(chaincodeName);
        // Initialize a set of asset data on the ledger using the chaincode 'InitLedger' function.
        await initLedger(contract);
        // Return all the current assets on the ledger.
        await getAll(contract);
        // Create a new asset on the ledger.
        await createContract(contract);
        // Get the asset details by userId.
        await getById(contract);
    } finally {
        gateway.close();
        client.close();
    }
}
/* การทำงานของฟังก์ชันนี้คือ ถ้าเกิดข้อผิดพลาดใดๆ จะแสดงข้อความผิดพลาดออกมาและปิดการทำงานของโปรแกรม */
main().catch(error => {
    console.error('******** FAILED to run the application:', error);
    process.exitCode = 1;
});
// ----------------------- ฟังก์ชันที่เราต้องการใช้งานร่วมกับ Chaincode ------------
async function initLedger(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction เรียกใช้ฟังก์ชัน InitLedger ที่อยู่ Chaincode');
    // InitLedger คือชื่อฟังก์ชันที่อยู่ใน Chaincode ของเรา
    await contract.submitTransaction('InitLedger');
    console.log('*** Transaction InitLedger เสร็จสิ้น');
}
async function getAll(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction เรียกใช้ฟังก์ชัน GetAll ที่อยู่ Chaincode');
    // GetAll คือชื่อฟังก์ชันที่อยู่ใน Chaincode ของเรา
    const resultBytes = await contract.evaluateTransaction('GetAll');
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** GetAll:', result);
}
async function createContract(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction เรียกใช้ฟังก์ชัน CreateContract ที่อยู่ Chaincode');
    // CreateContract คือชื่อฟังก์ชันที่อยู่ใน Chaincode ของเรา
    await contract.submitTransaction(
        'CreateContract',
        userId,
        `appUser${userId}`,
        "100",
        "add from Fabric App"
    );
    console.log('*** Transaction CreateContract เสร็จสิ้น');
}
async function getById(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction เรียกใช้ฟังก์ชัน GetById ที่อยู่ Chaincode');
    // GetById คือชื่อฟังก์ชันที่อยู่ใน Chaincode ของเรา
    const resultBytes = await contract.evaluateTransaction('GetById', userId);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** GetById:', result);
}
// ----------------------- ฟังก์ชันที่เราต้องการใช้งานร่วมกับ Chaincode ------------