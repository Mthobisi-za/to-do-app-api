module.exports = function Database(pool, hash) {
    async function registerUser(username, password) {
        var hashedPass = hash.generate(password);
        var auth = username + hashedPass;
        var checker = (await pool.query('select * from users where username = $1', [username])).rows;
        if (checker.length == 0) {
            await pool.query(`insert into users(username, password, auth_token) values($1,$2, $3)`, [username, hashedPass, auth]);
        }
    }
    async function getUser(username) {
        var userData = (await pool.query('select * from users where username = $1', [username])).rows;
        if (userData.length !== 0) {
            return {
                'status': 'ok',
                'data': userData[0]
            }
        } else {
            return {
                'status': 'user does not exist',
                'data': 'no data'
            }
        }
    }
    async function addTask(task, auth) {
        if (task) {
            var checker = (await pool.query('select * from tasks where task = $1 and auth = $2', [task, auth])).rows
            console.log(checker);
            if (checker.length == 0) {
                await pool.query('insert into tasks(auth, task) values($1,$2)', [auth, task])
            }
        }
    }
    async function deleteTask(task, auth) {
        if (task) {
            var checker = (await pool.query('select * from tasks where task = $1 and auth = $2', [task, auth])).rows
            console.log(checker);
            if (checker.length == 1) {
                await pool.query('delete from tasks where task = $1 and auth = $2', [task, auth]);
            }
        }
    }
    return {
        registerUser,
        getUser,
        addTask,
        deleteTask
    }
}