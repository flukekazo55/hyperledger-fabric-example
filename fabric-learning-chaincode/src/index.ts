// EXPORT contract chaincode ที่เราต้องการใช้งานกับ Peer และ Channel
import { UserContract } from './user-payment.chaincode';
export { UserContract } from './user-payment.chaincode';
export const contracts: any[] = [UserContract];
