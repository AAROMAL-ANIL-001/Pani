const mongoClient = require('mongodb').MongoClient
const state ={
    db:null
}
module.exports.connect=function(done){
    const uri = "mongodb+srv://aaromal:u8nNcEWxKLNwEv0i@cluster0.gtyntyu.mongodb.net/"
    const url ='mongodb://localhost:27017'
    const dbname = 'infinity'

    mongoClient.connect(uri,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })

}

module.exports.get=function(){
    return state.db
}