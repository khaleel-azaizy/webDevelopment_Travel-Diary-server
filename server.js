const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const knex = require('knex');
const cors = require('cors'); // Import the cors package

const db = knex({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: 'khaleel2001',
        database: 'destinations',
        port: 3306
    }
});

const app = express();

let initialPath = path.join(__dirname, "public");
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(cors()); // Use the cors middleware
app.use(bodyParser.json());
app.use(express.static(initialPath));
app.get('/', (req, res) => {
    res.sendFile(path.join(initialPath, "home.html"));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(initialPath, "login.html"));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(initialPath, "register.html"));
});

app.post('/register-user', (req, res) => {
    const { username, email, password } = req.body;

    console.log('Received registration request with:', { username, email, password }); // Debug log

    if (!username.length || !email.length || !password.length) {
        res.json('fill all the fields');
    } else {
        db("users").insert({
            username: username,
            email: email,
            password: password
        })
        .then(() => {
            return db.select("username", "email", "id").from("users").where({ email: email });
        })
        .then(data => {
            res.json(data[0]);
        })
        .catch(err => {
            console.error('Error during registration:', err); // Log the error
            if (err.code === 'ER_DUP_ENTRY') {
                res.json('email already exists');
            } else {
                res.status(500).json('An error occurred');
            }
        });
    }
});

app.post('/login-user', (req, res) => {
    const { email, password } = req.body;

    console.log('Received login request with:', { email, password }); // Debug log

    db.select('username', 'email', 'password', 'id')
    .from('users')
    .where({ email: email })
    .then(data => {
        console.log('Database response:', data); // Debug log

        if (data.length && data[0].password === password) {
            res.json({ username: data[0].username, email: data[0].email, id: data[0].id });
        } else {
            res.json('email or password is incorrect');
        }
    })
    .catch(err => {
        console.error(err); // Log the error
        res.status(500).json('An error occurred');
    });
});

app.get('/top-trips', (req, res) => {
    db.select('id', 'location', 'description', 'image_url', 'rating')
      .from('trips')
      .orderBy('rating', 'desc')
      .then(trips => {
        console.log('Fetched top trips:', trips); 
        res.json(trips);
      })
      .catch(err => {
        console.error('Error fetching top trips:', err);
        res.status(500).json('An error occurred while fetching top trips');
      });
});
app.post('/add-trip', (req, res) => {
    const { location, description, image_url, rating, userid } = req.body;
  
    console.log('Received request to add trip with data:', req.body); // Debug log
  
    if (!location || !description || !image_url || !rating || !userid) {
      console.error('Missing required fields'); // Log the error
      return res.status(400).json('Missing required fields');
    }
  
    db('trips').insert({
      location: location,
      description: description,
      image_url: image_url,
      rating: rating,
      userid: userid
    })
    .then(() => {
      res.status(201).json('Trip added successfully');
    })
    .catch(err => {
      console.error('Error adding trip:', err); // Log the error
      res.status(500).json('An error occurred while adding the trip');
    });
  });

  app.get('/user-trips/:userid', (req, res) => {
    const userid = req.params.userid;
  
    db.select('id', 'location', 'description', 'image_url', 'rating')
      .from('trips')
      .where({ userid: userid })
      .then(trips => {
        res.json(trips);
      })
      .catch(err => {
        console.error('Error fetching user trips:', err); // Log the error
        res.status(500).json('An error occurred while fetching user trips');
      });
  });
  app.get('/search-trips', (req, res) => {
    const searchQuery = req.query.q;
  
    db.select('id', 'location', 'description', 'image_url', 'rating')
      .from('trips')
      .where('location', 'like', `%${searchQuery}%`)
      .orWhere('description', 'like', `%${searchQuery}%`)
      .then(trips => {
        res.json(trips);
      })
      .catch(err => {
        console.error('Error searching trips:', err); // Log the error
        res.status(500).json('An error occurred while searching for trips');
      });
  });
  
  
  app.listen(3000, () => {
    console.log('listening on port 3000......');
});