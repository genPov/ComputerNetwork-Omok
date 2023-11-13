function nullCheck() {
    for (let i = 0; i < arguments.length; i++) {
        if (arguments[i] == null) {
            return false;
        }
    }
    return true;
}

function isDuplicated(connection,uid) {
    let query = 'SELECT * FROM users WHERE uid=?';
    connection.query(query,[uid],(error,rows,fields) => {
        if (error) throw error;
        else {
            if (rows.length > 0) {
                return true;
            }else {
                return false;
            }
        }
    })

}

// 승 패 정보 업데이트
function updateInfo(connection,winner, loser) {
    let winnerQuery = 'UPDATE users SET win=users.win+1 WHERE uid=?; UPDATE users SET rating=rating+10 WHERE uid=?';
    let loserQuery = 'UPDATE users SET lose=users.lose+1 WHERE uid=?; UPDATE users SET rating=rating-5 WHERE uid=?';
    
    connection.query(winnerQuery,[winner,winner],(errors,result) => {
        if (error) throw error;
        else {
            console.log(result,'승자 업데이트 완료');
        }
    })
   
    connection.query(loserQuery,[loser,loser],(errors,result) => {
        if (error) throw error;
        else {
            console.log(result,'패자 업데이트 완료');
        }
    })
}
// 랭킹 업데이트
function updateRank(connection) {
    let SearchQuery = "SELECT * FROM users ORDER BY rating DESC";
    let updateQuery = "UPDATE users SET ranking=? WHERE uid=?";

    connection.query(SearchQuery,(error,rows) => {
        if (error) throw error;
        //console.log(rows);

        for (let i =0; i<rows.length; i++) {
            connection.query(updateQuery,[i+1,rows[i].uid],(error,result) => {
                if (error) throw error;
                else {
                    console.log(result);
                }
            })
        }
    })
}

module.exports = { nullCheck, updateInfo,isDuplicated, updateRank };