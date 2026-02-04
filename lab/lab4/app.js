console.log("APP.JS FILE LOADED");

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { Pool } = require('pg');
require('dotenv').config();


// Global variable to store database credentials
let dbConfig = null;
let pool = null;

const app = express();
const port = 3000;
app.use(bodyParser.json());

// Check for environment variables
if (process.env.DB_HOST && process.env.DB_PORT && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD) {
    dbConfig = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    };
    pool = new Pool(dbConfig);
    console.log("Database configured via environment variables.");
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // For CSS/Images if needed
app.set('view engine', 'ejs');

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

function isAuthenticated(req, res, next) {
    // TODO: Implement authentication check
    if(!req.session.user) {
        return res.redirect('/login');
    }
    next();
}   

function isInstructor(req, res, next) {
    // TODO: Implement check for instructor role
    if(req.session.user.role !== 'instructor') {
        return res.status(403).send("Access denied");
    }
    next();
}

// Function to get or initialize the pool
function getPool() {
    if (!pool && dbConfig) {
        pool = new Pool(dbConfig);
    }
    return pool;
}

// Route to serve the credentials form
// Route to serve the credentials form - DEPRECATED
// app.get('/', (req, res) => {
//     if (dbConfig) {
//         res.redirect('/login');
//     } else {
//         res.render('credentials');
//     }
// });

app.get('/', (req, res) => {
    res.redirect('/login');
});

// Route to handle credentials submission - DEPRECATED
// app.post('/set-credentials', (req, res) => {
//     ...
// });


app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// TODO: Implement user login logic
// 1. Check credentials in Users table
// 2. Set session user
// 3. Redirect to appropriate dashboard based on role
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    pool = getPool();
    if (!pool) {
        return res.status(500).send("Database not configured");
    }

    try {
        const client = await pool.connect();
        const result = await client.query(
            'SELECT * FROM Users WHERE username = $1 AND password = $2',
            [username, password]
        );
        client.release();

        if (result.rows.length > 0) {
            const user = result.rows[0];
            req.session.user = {
                user_id: user.user_id,
                username: user.username,
                role: user.role
            };
            return res.redirect(
                user.role === 'instructor'
                    ? '/instructor/dashboard'
                    : '/student/dashboard'
            );
        } 
        else {
            return res.render('login', { error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err);
        return res.render('login', { error: 'An error occurred' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


// TODO: Render student dashboard
// 1. Fetch registered courses for the student
// 2. Fetch all available courses (exclude registered ones)
// 3. Calculate total credits
app.get('/student/dashboard', isAuthenticated, async (req, res) => {
    if  (req.session.user.role !== 'instructor') {
        pool = getPool();
        if(!pool) {
            return res.status(500).send("Database not configured");
        }
        try{
            const { user_id, username, role } = req.session.user;
            const client = await pool.connect();
            const registered_courses  = await client.query(
                'SELECT course_id, course_name, credits, slot FROM Courses WHERE Courses.course_id IN (SELECT course_id FROM Registrations WHERE student_id = $1)',
                [user_id]
            );
            const available_courses = await client.query(
                'SELECT course_id, course_name, credits, slot, capacity FROM courses WHERE courses.slot NOT IN (SELECT courses.slot FROM Courses WHERE Courses.course_id IN (SELECT course_id FROM Registrations WHERE student_id = $1))',
                [user_id]
            );
            client.release();            
            var totalCredits  = 0;
            registered_courses.rows.forEach(course => {
                totalCredits += course.credits;
            });

            return res.render('student_dashboard', {available_courses: available_courses.rows, registered_courses: registered_courses.rows, totalCredits: totalCredits});
        }
        catch (err){
            console.log(err);
            return res.render('login', {error: 'An error occured'});
        }
    }
    else {
        return res.render('login', {error: 'Your are not logged in'});
    }
});

// TODO: Implement registration logic
// 1. Check if course exists
// 2. Check for Slot Clash (Cannot register for same slot twice)
// 3. Check Credit Limit (Max 24 credits)
// 4. Check Course Capacity (Optional)
// 5. Insert into Registrations table
app.post('/student/register', isAuthenticated, async (req, res) => {
    const { course_id } = req.body;
    pool = getPool();
    if(!pool){
        return res.status(500).send("Database not configured");
    }
    try{
        const {user_id, username, role} = req.session.user;
        if(role !== 'student'){
            return res.render('login', {error: 'You are not logged in as a student'});
        }
        const client  = await pool.connect();
        const courseRes = await client.query('select * from Courses where course_id = $1', [course_id]);
        const course = courseRes.rows[0];

        const reg = await client.query(
            `select r.*, c.slot, c.credits 
             FROM Registrations r 
             JOIN Courses c ON r.course_id = c.course_id 
             WHERE r.student_id = $1`, 
            [user_id]
        );
        const current = reg.rows;

        if (current.some(r => r.course_id === course_id)) {
            client.release();
            return res.status(400).send(" Error: Course already registered.");
        }

        if (current.some(r => r.slot === course.slot)) {
            client.release();
            return res.status(400).send(`Error: Slot clash with ${course.slot}`);
        }

        const tot_cred = current.reduce((sum, r) => sum + r.credits, 0);
        if (tot_cred + course.credits > 24) {
            client.release();
            return res.status(400).send("Error: Credit limit exceeded.");
        }

        const cap = await client.query('SELECT COUNT(*) FROM Registrations WHERE course_id = $1', [course_id]);
        if (parseInt(cap.rows[0].count) >= course.capacity) {
            client.release();
            return res.status(400).send("Course is full.");
        }

        const result_ = await client.query(
            'INSERT INTO Registrations (student_id, course_id) VALUES ($1, $2)',
            [user_id, course_id]
        );

        client.release();
        console.log("Registered a course for a student");
        return res.redirect('/student/dashboard');
    }
    catch (err){
        console.log(err);
        return res.status(500).render('login', {error: 'An error occurred while registering the course'});
    }
});

// TODO: Implement drop logic
// 1. Delete from Registrations table
app.post('/student/drop', isAuthenticated, async (req, res) => {
    const { course_id } = req.body;
    pool = getPool();
    if(!pool){
        return res.status(500).send("Database not configured");
    }
    try{
        const {user_id, username, role} = req.session.user;
        if(role !== 'student'){
            return res.render('login', {error: 'You are not logged in as a student'});
        }
        const client  = await pool.connect();
        const result = await client.query(
            'DELETE FROM Registrations WHERE student_id = $1 AND course_id = $2',
            [user_id, course_id]
        );
        client.release();
        console.log("Deleted a course from a students");
        return res.redirect('/student/dashboard');
    }
    catch (err){
        console.log(err);
        return res.status(500).render('login', {error: 'An error occurred while dropping the course'});
    }
});


// TODO: Render instructor dashboard
// 1. Fetch courses taught by this instructor
app.get('/instructor/dashboard', isAuthenticated, isInstructor, async (req, res) => {
    if  (req.session.user.role === 'instructor') {
        pool = getPool();
        if(!pool) {
            return res.status(500).send("Database not configured");
        }
        try{
            const { user_id, username, role } = req.session.user;
            const client = await pool.connect();
            const courses  = await client.query(
                'select course_id, course_name, credits, slot from courses where courses.instructor_id = $1',
                [user_id]
            );
            client.release();    
            return res.render('instructor_dashboard', {courses: courses.rows});
        }
        catch (err){
            console.log(err);
            return res.render('login', {error: 'An error occured'});
        }
    }
    else {
        return res.render('login', {error: 'You are not logged in'});
    }
});

// TODO: Show students enrolled in a specific course
// 1. Verify instructor owns the course
// 2. Fetch enrolled students
app.get('/instructor/course/:id', isAuthenticated, isInstructor, async (req, res) => {
    console.log("Gandu");
    // const { course_id } = req.body; This line does not work
    pool = getPool();
    if(!pool) {
        return res.status(500).send("Database not configured");
    }
    try{
        const { user_id, username, role } = req.session.user;
        const client = await pool.connect();

        const inst = await client.query(
            `select * from courses
            WHERE courses.instructor_id = $1`, 
            [user_id]
        );
        const current = inst.rows;

        if (!(current.some(r => r.course_id === course_id))) {
            client.release();
            return res.status(400).send("Not the instructor of course.");
        }

        const stud = await client.query(
            `select student_id, username, full_name
            from registrations r join users u on r.student_id = u.user_id
            where r.course_id = $1
            `, [course_id]
        ) 
        const student_info = stud.rows;

        client.release();    
        return res.render('instructor/course/:id', {student_info: student_info.rows});
    }
    catch (err){
        console.log(err);
        return res.render('login', {error: 'An error occured'});
    }
    
});


// TODO: Implement manual student addition
// 1. Check if student exists
// 2. Check if already enrolled
// 3. Check Credit Limit (If exceeded, allow but show WARNING)
// 4. Insert into Registrations
app.post('/instructor/add-student', isAuthenticated, isInstructor, async (req, res) => {

});


// TODO: Implement student removal
// 1. Delete from Registrations
app.post('/instructor/remove-student', isAuthenticated, isInstructor, async (req, res) => {

});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
