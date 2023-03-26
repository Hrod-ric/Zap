import {openDb} from './banco.js'

export async function createTable(){
    openDb().then(db=>{
        db.exec('CREATE TABLE IF NOT EXISTS pessoas ( id INTEGER PRIMARY KEY, nome TEXT, idade INTEGER )')
    })
}