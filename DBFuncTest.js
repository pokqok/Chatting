// main.js 파일
//const mysql = require('mysql');
const mysql = require('mysql2');
//const selectQueries = require('./queryModule');
//const updateQueries = require('./queryModule');
//지금 임포트하는데 문제 생겨서 모듈 가져와서 합침

const selectQueries = {
  getAllUsers: 'SELECT * FROM user_info',
  getRoomID: 'SELECT room_id FROM room WHERE ? IN ( room_owner_id, room_member_id_1, room_member_id_2 ,room_member_id_3, room_member_id_4)', //?는 유저의id이다.
  getNewRoomID : 'SELECT room_id FROM room WHERE room_owner_id = ?', //?=반장의 id이다. 
  getUserID: 'SELECT nickname AS name, pass_word AS password FROM user_info WHERE id = ?', // ? = 유저의 아이디로 유저 정보 색인
  verifyUser: 'SELECT nickname AS name FROM user_info WHERE id = ? and pass_word = ?', //[?,?]유저의 id와 비밀번호로 있는지 확인, 없을 시 undefined 반환
};

const updateQueries = {
  insertUser: `UPDATE room 
  SET room_member_id_1 = CASE 
      WHEN ? IN (room_member_id_1,room_member_id_2,room_member_id_3,room_member_id_4) THEN room_member_id_1 
      WHEN room_member_id_1 IS NULL THEN ?
      ELSE  room_member_id_1 
      END,
  room_member_id_2 = CASE
      WHEN ? IN (room_member_id_1,room_member_id_2,room_member_id_3,room_member_id_4) THEN room_member_id_2
      WHEN room_member_id_1 IS NOT NULL AND room_member_id_2 IS NULL THEN ?
      ELSE room_member_id_2
      END,
  room_member_id_3 = CASE
    WHEN ? IN (room_member_id_1,room_member_id_2,room_member_id_3,room_member_id_4) THEN room_member_id_3
      WHEN room_member_id_1 IS NOT NULL AND room_member_id_2 IS NOT NULL AND room_member_id_3 IS NULL THEN ?
      ELSE room_member_id_3
      END,
  room_member_id_4 = CASE
    WHEN ? IN (room_member_id_1,room_member_id_2,room_member_id_3,room_member_id_4) THEN room_member_id_4
      WHEN room_member_id_1 IS NOT NULL AND room_member_id_2 IS NOT NULL AND room_member_id_3 IS NOT NULL AND room_member_id_4 IS NULL THEN ?
      ELSE room_member_id_4
      END
  WHERE room_id = ? AND 
   room_id NOT IN (
    SELECT room_id 
    FROM (
      SELECT room_id
      FROM room
      WHERE room_member_id_1 IS NOT NULL 
      AND room_member_id_2 IS NOT NULL 
      AND room_member_id_3 IS NOT NULL 
      AND room_member_id_4 IS NOT NULL
      ) AS subquery
    )`,
  //SET문의 ?들은 user id이고, WHERE구문의 ?는 room id이다.
  deleteUser: `UPDATE room 
  SET room_member_id_1 = CASE 
      WHEN room_member_id_1 = ? THEN NULL
      ELSE room_member_id_1
      END,
  room_member_id_2 = CASE 
      WHEN room_member_id_2 = ? THEN NULL
      ELSE room_member_id_2
      END,
  room_member_id_3 = CASE 
      WHEN room_member_id_3 = ? THEN NULL
      ELSE room_member_id_3
      END,
  room_member_id_4 = CASE 
      WHEN room_member_id_4 = ? THEN NULL
      ELSE room_member_id_4
      END
  WHERE room_id = ?`,
  //SET문의 ?들은 user id이고, WHERE구문의 ?는 room id이다.
  createRoom_OLD: 'INSERT INTO room(room_id,room_name,room_owner_id) VALUES (?, ?, ?)',
  createRoom: 'INSERT INTO room(room_id,room_name,room_owner_id) VALUES ((select room_id from(select max(room_id) as room_id from room)AS newNum) + 1 , ?, ?)'
  //위에서 색인하여 (count+1, 유저이름's room, 방장id) 으로 나타내도록 한다.
};

//------------------------함수 부분-------------------------------------------

function getRoomID(userID) {
    connection.query(selectQueries.getRoomID, [userID], (error, results) => {
        if (error) {
          console.error('방 찾기 쿼리에서 문제 발생 :', error);
          return;
        }
        console.log('방 찾기 결과 :', results);
        
      });
  }

  function getNewRoomID(userID) {
    connection.query(selectQueries.getNewRoomID, [userID], (error, results) => {
        if (error) {
          console.error('새 방 찾기 쿼리에서 문제 발생 :', error);
          return;
        }
    
        console.log('새 방 찾기 결과 : ', results);
        
      });
  }

  function getUserID(userID) {
    connection.query(selectQueries.getUserID, [userID], (error, results) => {
        if (error) {
          console.error('유저 찾기 쿼리에서 문제 발생 :', error);
          return;
        }
    
        console.log('유저 찾기 결과 : ', results);
        
      });
  }

  function verifyUser(userID, password) {
    connection.query(selectQueries.verifyUser, [userID, password], (error, results) => {
        if (error) {
          console.error('유저 인증 쿼리에서 문제 발생 :', error);
          return;
        }

        if(results == undefined){ //유저 정보 없는 경우
            console.log("해당 유저 정보가 없습니다.");
            return false;
          }else{
            const userName = results.nickname;
            console.log("인증 성공! :" + userName);
            return true;
          }
        //console.log('인증 결과 : ', results);
      });
  }

  //----------------------방에 유저 넣기, 없애기, 새 방 생성----------------------

  function insertUser(roomID,userID) { //방에 유저 추가
    connection.query(updateQueries.insertUser, [userID,userID,userID,userID,userID,userID,userID,userID,roomID], (error, results) => {
        if (error) {
          console.error('SQL에러 발생:', error);
          return;
        }
        console.log('실행 결과 :', results);
        //return results;
      });
  }

  function deleteUser(roomID,userID) { //방에서 유저 삭제
    connection.query(updateQueries.deleteUser, [userID,userID,userID,userID,roomID], (error, results) => {
        if (error) {
          console.error('SQL에러 발생:', error);
          return;
        }
        console.log('실행 결과 :', results);
        //return results;
      });
  }
/*
 function createRoom(hostID) {
  const newRoom= 'INSERT INTO room(room_id,room_name,room_owner_id) VALUES ((select max(room_id) from room) + 1 , ?, ?)'
  const getID = 'SELECT room_id FROM room ORDER BY room_id ASC';
  let newID = 1;
  const hostName = `${hostID}의 그룹`;
  console.log("크리에이티브 실행")
  connection.query(getID, (error, result_ID) => {
    if (error) {
      console.error('id 색인 과정에서 ERROR 발생:', error);
      return;
    }

    const existID = result_ID.map((row) => row.room_id);
    while (existID.includes(newID)) {
      newID++;
      console.log(newID);
    }
    console.log(newID);
    connection.destroy();
    setTimeout(() => {
      console.log("after 1sec");
    }, 1000);
    connection.query(updateQueries.createRoom, [newID, hostName, hostID], (error, result_room) => {
      if (error) {
        console.error('방 생성 과정 중 문제 발생:', error);
        return;
      }
      console.log("생성완료 결과 : ",result_room);
      // return results;
    });
  });
 }
*/
 function createRoom(hostID) {
  const hostName = `${hostID}의 그룹`;
    connection.query(updateQueries.createRoom, [hostName, hostID], (error, result_room) => {
      if (error) {
        console.error('방 생성 과정 중 문제 발생:', error);
        return;
      }
      console.log("생성완료 결과 : ",result_room);
      // return results;
    });
 }
//------------------------연결 설정 부분---------------------

const connection = mysql.createConnection({
  host: '34.64.139.219',
  user: 'user',
  password: 'thrhd0604',
  database: 'messanger'
});

connection.connect((error) => {
  if (error) {
    console.error('연결 실패:', error);
    return;
  }
  console.log('successfully connected with MySQL!');
});

//---------------------함수 실행 구간---------------------

getUserID('user1');
getRoomID('user3');
verifyUser('user3','0530');
getUserID(1);
//insertUser(1,'user4');
//deleteUser(1,'user4');
//createRoom('user2');
//다음처럼 함수 실행

//--------------------------------------------------------
connection.end();
