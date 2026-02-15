const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// do the db connection as done in the previous lab

// CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Session
app.use(session({
  secret: "expense_splitter_secret",
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
}));

// TODO: Implement authentication middleware
// Redirect unauthenticated users to the login page with respective status code
function checkAuth(req, res, next) {
  // TODO
  if(!req.session.user || !req.session) {
      return res.status(500).redirect('/login');
  }
  next();
}

// TODO: Implement balance update logic
// This function will be used to update balances 
// while adding expenses and settlements
async function updateBalance(client, payerId, debtorId, amount) {
  // TODO
    const result = await client.query(
        `UPDATE Balance
        SET amount = amount + $3
        WHERE user_id = $1 AND other_user_id = $2`,
        [payerId, debtorId, amount]
    );
    const result2 = await client.query(
        `UPDATE Balance
        SET amount = amount - $3
        WHERE user_id = $1 AND other_user_id = $2`,
        [debtorId, payerId, amount]
    );

    if (result.rowCount === 0) {
        await client.query(
            `INSERT INTO Balance (user_id, other_user_id, amount)
            VALUES ($1, $2, $3)`,
            [payerId, debtorId, amount]
        );
    }
    if (result2.rowCount === 0){
        await client.query(
            `INSERT INTO Balance (user_id, other_user_id, amount)
            VALUES ($1, $2, $3)`,
            [debtorId, payerId, -amount]
        );
    }
}

// ---------------- AUTH ROUTES ----------------

// TODO: Implement user signup logic
// return JSON object with the following fields: {username, password, email}
// use correct status codes and messages mentioned in the lab document

// app.get('/', (req, res) => {
//     res.redirect('/login');
// });

// app.get('/login', (req, res) => {
// });

app.post('/signup', async (req, res) => {
    // TODO
    const { username, email, password } = req.body;

   
    try {
        const client = await db.connect();

        const exists = await client.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (exists.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hash = await bcrypt.hash(password, 10);        
        console.log("SIGNUP HASH VALUE", hash);
        const results = await client.query(
            'INSERT INTO users (username, password_hash, email) VALUES($1, $2, $3) RETURNING user_id',
            [username, hash, email]
        );
        client.release();

        if(results.rows.length == 0){
            console.log("Inserted record.... not actually inserted???");
            return res.status(400).json({ message: "Server Error" });
        }
        const result = results.rows[0];
        return res.status(200).json({
            user_id: result.user_id,
            username: username
        })

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }
});

// TODO: Implement user login logic
app.post('/login', async (req, res) => {
    // TODO
    const { username, password } = req.body;
    try {
        const client = await db.connect();
        const result = await client.query(
            'SELECT * FROM Users WHERE username = $1',
            [username]
        );
        client.release();

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if(isMatch){
                req.session.user = {
                    user_id: user.user_id,
                    username: user.username
                };
                return res.status(200).json({
                    message: "Login successful",
                    user: {
                        user_id: user.user_id,
                        username: user.username
                    }
                });
            }
            else{
                console.log("Wrong Password");
                return res.status(400).json({ message: "Invalid credentials" });
            }
        } 
        else {
            console.log("Wrong username");
            return res.status(400).json({ message: "Invalid credentials" });
        }   
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }
});

// TODO: Check if user is logged in
app.get('/isLoggedIn', (req, res) => {

    // TODO
    if (req.session && req.session.user) {
        return res.status(200).json({
        loggedIn: true,
        user: {
            user_id: req.session.user.user_id,
            username: req.session.user.username
        }
        });
    }

    return res.status(200).json({
        loggedIn: false
    });
});

// TODO: Implement logout functionality
app.post('/logout', (req, res) => {
    // TODO
    req.session.destroy();
    return req.status(200).json({message : "Logged out"});
});

// ---------------- FRIENDS ROUTES ----------------

// TODO: Search users by username (excluding current user)
app.get('/users/search', checkAuth, async (req, res) => {
    // TODO
        const {q} = req.query;
        if(!q){
                return res.status(200).json([]);
        }
        
        try {
                const client = await db.connect();

                const result = await client.query(
                `SELECT user_id, username FROM users
                WHERE username ILIKE $1 AND user_id <> $2`,
                [`%${q}%`, req.session.user.user_id]
                );
                client.release();
                return res.status(200).json(result.rows);
        }
        catch (err) {
                console.error(err);
                return res.status(500).json({ message: "Server Error" });
        }

});

// TODO: Add a friend (bidirectional)
app.post('/friends/add', checkAuth, async (req, res) => {
  // TODO
    const {friend_id} = req.body;
    
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const result = await client.query(
        `SELECT user_id FROM users WHERE user_id = $1`,
        [friend_id]
        );
        if(result.rows.length > 0){
            const add_ = await client.query(
                `INSERT INTO friend (user_id, friend_id) VALUES ($1, $2), ($2, $1)`,
                [req.session.user.user_id, friend_id]
            );
            await client.query('COMMIT');
            client.release();
            return res.status(200).json({message: "Friend added"});
        }
        else{
            client.release();
            return res.status(200).json({message: "User does not exist"});
        }
        
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        client.release();
        return res.status(500).json({ message: "Server Error" });
    }
});

// TODO: Fetch friend list of logged-in user
app.get('/friends', checkAuth, async (req, res) => {
  // TODO
    const user_id = req.session.user.user_id;
    
    try {
        const client = await db.connect();

        const result = await client.query(
        `SELECT user_id, username FROM users
        WHERE user_id IN (SELECT friend_id FROM friend WHERE user_id = $1)`,
        [user_id]
        );
        client.release();
        return res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }
});

// ---------------- GROUP ROUTES ----------------

// TODO: Create a new group and add members
app.post('/groups', checkAuth, async (req, res) => {
  // TODO
    const { name, member_ids } = req.body;
    const created_by = req.session.user.user_id;

    
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const groupResult = await client.query(
            `INSERT INTO Groups (name, created_by) VALUES ($1, $2)
            RETURNING group_id`,
            [name, created_by]
        );

        const group_id = groupResult.rows[0].group_id;

        await client.query(
            `INSERT INTO GroupMember (group_id, user_id) VALUES ($1, $2)`,
            [group_id, created_by]
        );

        for (const member_id of member_ids) {
            await client.query(
                `INSERT INTO GroupMember (group_id, user_id)
                VALUES ($1, $2)`,
                [group_id, member_id]
            );
        }

        await client.query('COMMIT');

        return res.status(200).json({
            message: "Group created",
            group_id: group_id
        });
     
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        client.release();
        return res.status(500).json({ message: "Server Error" });
    }
});

// TODO: Fetch all groups of logged-in user
app.get('/groups', checkAuth, async (req, res) => {
  // TODO
    const user_id = req.session.user.user_id;
    
    try {
        const client = await db.connect();

        const result = await client.query(
            `SELECT g.group_id, g.name FROM Groups g JOIN GroupMember gm ON g.group_id = gm.group_id
            WHERE gm.user_id = $1`,
            [user_id]
        );
        client.release();
        return res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }
});

// TODO: Fetch group details and members
app.get('/groups/:id', checkAuth, async (req, res) => {
  // TODO
    const group_id = req.params.id;
    const user_id = req.session.user.user_id;
    
    try {
        const client = await db.connect();

        const memb = await client.query(
            `SELECT 1 FROM groupmember 
            WHERE group_id = $1 AND user_id = $2`,
            [group_id, user_id]
        );
        if (memb.rowCount === 0) {
        client.release();
        return res.status(400).json({ message: "Group not found" });
        }

        const result = await client.query(
        `SELECT group_id, name, created_by FROM groups
        WHERE group_id = $1`,
        [group_id]
        );
        const member = await client.query(
        `SELECT user_id, username FROM users u JOIN groupmember g ON u.user_id = g.user_id
        WHERE group_id = $1`,
        [group_id]
        );

        client.release();
        return res.status(200).json({
            group: result.rows[0],
            members: member.rows
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }

});

// ---------------- EXPENSE ROUTES ----------------

// TODO: Add an expense, splits, and update balances
app.post('/expenses', checkAuth, async (req, res) => {
  // TODO
    const { group_id, description, amount, paid_by, splits } = req.body;
    
    if (!group_id || !description || !amount || !paid_by || !splits) {
        return res.status(400).json({ message: "Missing Fields" });
    }
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(
            `INSERT INTO Expense (group_id, description, amount, paid_by)
            VALUES ($1, $2, $3, $4)
            RETURNING expense_id`,
            [group_id, description, amount, paid_by]
        );
        const expense_id = result.rows[0].expense_id;

        for (const split of splits) {
            await client.query(
                `INSERT INTO ExpenseSplit (expense_id, user_id, share_amount)
                VALUES ($1, $2, $3)`,
                [expense_id, split.user_id, split.share_amount]
            );
        }

        for (const split of splits) {
            const debtorId = split.user_id;
            const amount = parseFloat(split.share_amount);

            if (debtorId !== paid_by) {
                await updateBalance(client, paid_by, debtorId, amount);
            }
        }

        await client.query('COMMIT');
        client.release();

        return res.status(200).json({ message: "Expense added" });

    } catch (err) {
        await client.query('ROLLBACK');
        client.release();
        console.error(err);
        return res.status(500).json({ message: "Failed" });
    }
});

// TODO: Fetch expenses of a group
app.get('/groups/:id/expenses', checkAuth, async (req, res) => {
  // TODO
    const group_id = req.params.id;
    const user_id = req.session.user.user_id;

    
    try {
        const client = await db.connect();

        const memb = await client.query(
            `SELECT 1 FROM groupmember 
            WHERE group_id = $1 AND user_id = $2`,
            [group_id, user_id]
        );
        if (memb.rowCount === 0) {
        client.release();
        return res.status(400).json({ message: "Group not found" });
        }

        const result = await client.query(
            `SELECT e.expense_id, e.amount, e.description, u.username AS paid_by_name, e.created_at 
            FROM expense e JOIN users u ON e.paid_by = u.user_id
            WHERE group_id = $1`,
            [group_id]
        );

        client.release();
        return res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }
});

// ---------------- SETTLEMENT ROUTES ----------------

// TODO: Settle balance between two users
app.post('/settle', checkAuth, async (req, res) => {
  // TODO
  // 1. Record settlement
  // 2. Update Balance
    // from_user (Debtor) PAYS to_user (Creditor).
    // to_user's claim on from_user REDUCES. ('amount' in updateBalance is logic for INCREASE).
    // So we pass NEGATIVE amount to updateBalance(Creditor, Debtor, -amount).

    const {to_user, amount} = req.body;
    const user_id = req.session.user.user_id;
   
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(
            `INSERT INTO Settlement (from_user, to_user, amount)
            VALUES ($1, $2, $3) RETURNING settlement_id`,
            [user_id, to_user, amount]
        );

        await updateBalance(client, user_id, to_user, amount);
        client.release();

        await client.query('COMMIT');

        return res.status(200).json({ message: "Settled up successfully" });

    } catch (err) {
        await client.query('ROLLBACK');
        client.release();
        console.error(err);
        return res.status(500).json({ message: "Failed" });
    }    

});

// TODO: Fetch balances of logged-in user
app.get('/balances', checkAuth, async (req, res) => {
  // TODO
    const user_id = req.session.user.user_id;
    
    try {
        const client = await db.connect();

        const result = await client.query(
            `SELECT b.other_user_id, u.username, b.amount FROM Balance b JOIN Users u ON u.user_id = b.user_id
            WHERE b.user_id = $1`,
            [user_id]
        );
        client.release();
        return res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});





 