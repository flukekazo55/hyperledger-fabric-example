// Model ที่เราต้องการจัดเก็บ
import {Object, Property} from 'fabric-contract-api';
@Object()
export class UserPayment {
    @Property()
    public userId: number;

    @Property()
    public userName: string;

    @Property()
    public price: number;

    @Property()
    public notes?: string;
}
