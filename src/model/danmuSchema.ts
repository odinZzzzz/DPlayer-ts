import mongoose, {Schema, InferSchemaType} from 'mongoose';
import {config} from "../config";

const danSchema = new Schema<IDan>({
    player: {
        type: String,
        index: true,
    },
    author: String,
    time: Number,
    text: String,
    color: Number,
    type: Number,
    ip: String,
    referer: String,
    date: Number,
});

// type dan = InferSchemaType<typeof danSchema>;
interface IDan {
    player: string;
    author: number;
    time: number;
    text: string;
    color: number;
    type: number;
    ip: string;
    referer: string;
    date: number;

}


export const initMongo = async () => {
    let db_url = ""
    let db_config = config.db.mongo;
    let db_option = {};
    if (db_config.username && db_config.password) {
        db_url = `mongodb://${db_config.username}:${db_config.password}@${db_config.host}:${db_config.port}/dan_mongo`;
        db_option = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            authSource: 'admin'

        };
        if (db_config.rs_name) {
            db_url += `?replicaSet=${db_config.rs_name}`
        }
    } else {
        db_url = `mongodb://${db_config.host}:${db_config.port}/dan_mongo`;
        db_option = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
    }

    // const db = mongoose.connection;
    const db = await mongoose.createConnection(db_url, db_option)
    db.on('error', (e) => {
        console.error('Mongodb error: ', e);
    });
    db.once('open', () => {
        console.info('Mongodb connected');
    });
    return db.model('dan', danSchema);


}

