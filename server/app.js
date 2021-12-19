
import express from 'express';
import cors from 'cors';
import { default as mongodb } from 'mongodb';
import dotenv from "dotenv";
dotenv.config();

const MongoClient = mongodb.MongoClient;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



//npm i mongodb
// 몽고DB와 연결시키고 연결되면 port가 돌아갈 수 있도록 만들었다.
let db;




MongoClient.connect('mongodb+srv://jun:1234@cluster0.zjit4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
(error, client)=>{
    if(error){
        console.log(error);
    }else{
        db = client.db('NFTSTORAGE');
        app.listen(process.env.PORT || 80000,()=>{
            console.log('DB연결성공 and port구동중!');
        })
    }  
})
//test/
app.get('/',(req,res)=>{
    res.send('안녕하세요 ttmoon app입니다.')
})

//metadata를 생성해서 DB에 저장하는 메서드를 생성시켜보자.
const input = {
  name: '',
  external_url: '',
  description : '',
  chain: '',
  type: '',
  imgURI : ''
};

function inputMeta(name,external,description,chain,type,imgURI){
  input.name = name
  input.external_url = external
  input.description = description
  input.chain = chain
  input.type = type
  input.imgURI = imgURI
}


app.post('/create',(req,res)=>{

  //프론트에서 전달받은 Meta데이터값은 함수를 작성하여 묵어서 처리했다.
  // 그 이외 account는 따로 변수를 만들어서 받아서 처리하자.
     const account = req.body.account
     const tokenId = req.body.tokenId
     inputMeta(
       req.body.name,
       req.body.external_url,
       req.body.description,
       req.body.chain,
       req.body.type,
       req.body.imgURI
       )

       //DB에 이미 한번 저장이 되어있는 지 확인하자  -- 저장되어있으면 update, 새로운사람이면 insertOne을 진행하자.
        //account:[[tokenId,type],[tokenId,type],[tokenId,type]....]
        //2. {type : {toeknId:metadata}}
       
       if(account !== undefined){
        db.collection('NFTPOST').find({'account':account}).toArray((error,result)=>{
          if(result[0] !== undefined){
            //DB에 이미 한번 저장이 되어있는 상태면 추가해주는 쿼리를 날린다.
            db.collection('NFTPOST').update({account: 'a'},{"$push" :{"tokenIds":{"tokenId":tokenId,'type':input.type}},
          });
          //metadata저장하는 쿼리
              db.collection('Types').insertOne({type:input.type,data:{tokenId:tokenId,metadata:input}})
          }else{
             //처음이라면 저장해주자.
                db.collection('NFTPOST').insertOne({account:account,tokenIds:[{tokenId:tokenId,type:input.type}]},(error,result)=>{
                 console.log(result);
        });
          //metadata저장하는 쿼리
             db.collection('Types').insertOne({type:input.type,data:{tokenId:tokenId,metadata:input}})
          }
        })
       }
})




//메타데이터를 보내주는 작업이 끝!! 
app.get('/erc721/:tokenId',(req,res)=>{
     let tokenId = req.params.tokenId;
     db.collection('NFTPOST').find({'account':'0x1231`413'}).toArray((error,result)=>{
      console.log(result);
      if(error) console.log(error);
      if(result){
        res.send(result);
      }
    })
})

