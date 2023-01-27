import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import { UserPayment } from './user-payment.model';

@Info({ title: 'UserContract', description: 'Smart contract for trading assets' })
export class UserContract extends Contract {
    // method เริ่มต้นเมื่อสำหรับการกำหนดข้อมูลใน Blockchain เริ่มต้น
    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        // กำหนดข้อมูลเริ่มต้น
        const MOCK_DATA: UserPayment[] = [
            {
                userId: 1,
                userName: "test01",
                price: 30
            },
            {
                userId: 2,
                userName: "test02",
                price: 40
            }
        ];
        for (const item of MOCK_DATA) {
            await ctx.stub.putState(item.userId.toString(), Buffer.from(stringify(sortKeysRecursive(item))));
            console.info(`Asset ${item.userId} initialized`);
        }
    }

    // return ข้อมูลทั้งหมดที่ถูกจัดเก็บไว้ที่ world state
    @Transaction(false)
    @Returns('string')
    public async GetAll(ctx: Context): Promise<string> {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    // insert ข้อมูล ซึ่งข้อมูลจะถูกจัดเก็บไว้ที่ world state
    @Transaction()
    public async CreateContract(ctx: Context, userId: string, userName: string, price: string, notes?: string): Promise<void> {
        const exists = await this.CheckExistContract(ctx, userId);
        // ตรวจสอบข้อมูลที่อยู่ใน world state ว่ามีอยู่หรือไม่
        if (exists) {
            throw new Error(`ไม่พบข้อมูล userId: ${userId}`);
        }
        // set ข้อมูลที่ต้องการเพิ่ม
        const contract: UserPayment = {
            userId: parseInt(userId),
            userName: userName,
            price: parseInt(price),
            notes: notes
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(userId.toString(), Buffer.from(stringify(sortKeysRecursive(contract))));
    }

    // return ข้อมูลตาม userId (Primary Key) ที่ถูกจัดเก็บไว้ที่ world state
    @Transaction(false)
    public async GetById(ctx: Context, userId: string): Promise<string> {
        // return ข้อมูลที่อยู่ใน world state จาก userId
        const jsonData = await ctx.stub.getState(userId);
        // ตรวจสอบ jsonData ที่อยู่ใน world state ว่ามีอยู่หรือไม่
        if (!jsonData || jsonData.length === 0) {
            throw new Error(`ไม่พบข้อมูล userId: ${userId}`);
        }
        return jsonData.toString();
    }

    // update ข้อมูลที่อยุ่ใน world state
    @Transaction()
    public async UpdateContract(ctx: Context, userId: string, userName: string, price: string, notes?: string): Promise<void> {
        const exists = await this.CheckExistContract(ctx, userId);
        // ตรวจสอบข้อมูลที่อยู่ใน world state ว่ามีอยู่หรือไม่
        if (exists) {
            throw new Error(`ไม่พบข้อมูล userId: ${userId}`);
        }
        // set ข้อมูลที่ต้องการอัปเดต
        const contract: UserPayment = {
            userId: parseInt(userId),
            userName: userName,
            price: parseInt(price),
            notes: notes
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(userId.toString(), Buffer.from(stringify(sortKeysRecursive(contract))));
    }

    // delete ข้อมูลที่อยู่ใน world state
    @Transaction()
    public async DeleteContract(ctx: Context, userId: string): Promise<void> {
        const exists = await this.CheckExistContract(ctx, userId);
        // ตรวจสอบข้อมูลที่อยู่ใน world state ว่ามีอยู่หรือไม่
        if (exists) {
            throw new Error(`ไม่พบข้อมูล userId: ${userId}`);
        }
        return ctx.stub.deleteState(userId.toString());
    }

    // ตรวจสอบข้อมูลที่อยู่ใน world state ว่ามีอยู่หรือไม่
    @Transaction(false)
    @Returns('boolean')
    public async CheckExistContract(ctx: Context, userId: string): Promise<boolean> {
        const assetJSON = await ctx.stub.getState(userId);
        return assetJSON && assetJSON.length > 0;
    }
}
