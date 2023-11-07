const express = require('express');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Koblet til SQLite-databasen.');
    console.log('Du kan nå begynne å fylle databasen.');
});

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Endepunkt for å opprette databasen med riktige tabeller

app.get('/create-database', (req, res) => {
    // Opprett en ny databaseinstans
    let db = new sqlite3.Database('./database.db', (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Kunne ikke koble til databasen');
        } else {
            console.log('Koblet til SQLite-databasen.');
        }
    });


    // SQL for å opprette tabeller
    const sqlPeople = `
      CREATE TABLE IF NOT EXISTS people (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        alias TEXT NOT NULL,
        power TEXT NOT NULL,
        image TEXT NOT NULL,
        age REAL NOT NULL,
        location_id INTEGER
      );`;

    const sqlLocations = `
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city TEXT NOT NULL,
        country TEXT NOT NULL
      );`;

    // Utfør SQL-skriptet for å opprette people-tabellen
    db.run(sqlPeople, (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Kunne ikke opprette people-tabellen');
            return;
        }
        console.log('people-tabellen er opprettet.');
    });

    // Utfør SQL-skriptet for å opprette locations-tabellen
    db.run(sqlLocations, (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Kunne ikke opprette locations-tabellen');
            return;
        }
        console.log('locations-tabellen er opprettet.');
    });

    // Lukk databasetilkoblingen
    db.close((err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Kunne ikke lukke databasetilkoblingen');
            return;
        }
        console.log('Databasetilkoblingen er lukket.');
        res.send('Databasen og nødvendige tabeller er opprettet.');
    });

});


// Endepunkt for å tømme hele databasen
app.delete('/clear-database', (req, res) => {
    db.run(`DELETE FROM people`, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        db.run(`DELETE FROM locations`, (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({ message: "Databasen er tømt" });
        });
    });
});


app.post('/fill-database', (req, res) => {
    const locations = [
        { city: "Metropolis", country: "USA" },
        { city: "Gotham", country: "USA" },
        { city: "Themyscira", country: "Ukjent" },
        { city: "Asgard", country: "Ukjent" },
        { city: "New York", country: "USA" }
    ];

    locations.forEach(location => {
        db.run(`INSERT INTO locations (city, country) VALUES (?, ?)`, [location.city, location.country], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            const locationId = this.lastID;

            switch (location.city) {
                case "Metropolis":
                    db.run(`INSERT INTO people (name, alias, power, image, age, location_id) VALUES (?, ?, ?, ?, ?, ?)`, ["Clark Kent", "Superman", "Super strength, flight", "https://upload.wikimedia.org/wikipedia/en/3/35/Supermanflying.png", 35, locationId]);
                    break;
                case "Gotham":
                    db.run(`INSERT INTO people (name, alias, power, image, age, location_id) VALUES (?, ?, ?, ?, ?, ?)`, ["Bruce Wayne", "Batman", "Genius intellect, peak human physical condition", "https://i.pinimg.com/originals/35/5c/94/355c94e0f3eea5e63f1862ed1e4366be.png", 40, locationId]);
                    break;
                case "Themyscira":
                    db.run(`INSERT INTO people (name, alias, power, image, age, location_id) VALUES (?, ?, ?, ?, ?, ?)`, ["Diana Prince", "Wonder Woman", "Super strength, agility, lasso of truth", "https://upload.wikimedia.org/wikipedia/en/thumb/f/fd/Wonder_Woman_DC_Comics.png/220px-Wonder_Woman_DC_Comics.png", 5000, locationId]);
                    break;
                case "Asgard":
                    db.run(`INSERT INTO people (name, alias, power, image, age, location_id) VALUES (?, ?, ?, ?, ?, ?)`, ["Thor Odinson", "Thor", "God of thunder, Mjölnir", "https://p7.hiclipart.com/preview/759/233/109/thor-cartoon-marvel-cinematic-universe-marvel-animation-comics-thor.jpg", 1500, locationId]);
                    break;
                case "New York":
                    db.run(`INSERT INTO people (name, alias, power, image, age, location_id) VALUES (?, ?, ?, ?, ?, ?)`, ["Peter Parker", "Spider-Man", "Wall-crawling, spider sense", "https://i.pinimg.com/originals/17/02/d7/1702d7516cfda3b2c1e205a1ef1c1b4f.png", 22, locationId]);
                    break;
            }
        });
    });

    res.json({ message: "Databasen er fylt" });
});





app.get('/heroes', (req, res) => {
    db.all(`SELECT * FROM people`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});


app.get('/heroes/:id', (req, res) => {
    const personId = req.params.id;

    db.get(`SELECT * FROM people WHERE id = ?`, [personId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ message: "Person ikke funnet" });
            return;
        }
        res.json(row);
    });
});

app.get('/heroes-location/:id', (req, res) => {
    const personId = req.params.id;

    const query = `
        SELECT p.*, l.city, l.country
        FROM people p
        INNER JOIN locations l ON p.location_id = l.id
        WHERE p.id = ?
    `;

    db.get(query, [personId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ message: "Person ikke funnet" });
            return;
        }
        res.json(row);
    });
});


app.post('/add-hero', (req, res) => {
    const { name, alias, power, image, age, city, country, location_id } = req.body;

    if (location_id) {
        // Hvis location_id er gitt, legg direkte til personen
        db.run(`INSERT INTO people (name, alias, power, image, age, location_id) VALUES (?, ?, ?, ?, ?, ?)`, [name, alias, power, image, age, location_id], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: "Person lagt til!" });
        });
    } else {
        // Ellers sjekk om byen allerede eksisterer og legg til hvis nødvendig
        db.get(`SELECT id FROM locations WHERE city = ? AND country = ?`, [city, country], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            let locationId;
            if (row) {
                locationId = row.id;
            } else {
                db.run(`INSERT INTO locations (city, country) VALUES (?, ?)`, [city, country], function (err) {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    locationId = this.lastID;
                });
            }

            db.run(`INSERT INTO people (name, alias, power, image, age, location_id) VALUES (?, ?, ?, ?, ?, ?)`, [name, alias, power, image, age, locationId], (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ message: "Person lagt til!" });
            });
        });
    }
});

app.patch('/hero/:id', (req, res) => {
    const personId = req.params.id;
    const { name, alias, power, image, age } = req.body;

    let updateFields = [];
    let updateValues = [];

    if (name) {
        updateFields.push("name = ?");
        updateValues.push(name);
    }
    if (alias) {
        updateFields.push("alias = ?");
        updateValues.push(alias);
    }
    if (power) {
        updateFields.push("power = ?");
        updateValues.push(power);
    }
    if (image) {
        updateFields.push("image = ?");
        updateValues.push(image);
    }
    if (age) {
        updateFields.push("age = ?");
        updateValues.push(age);
    }

    if (updateFields.length === 0) {
        res.status(400).json({ error: "Ingen felter å oppdatere" });
        return;
    }

    const sql = `UPDATE people SET ${updateFields.join(", ")} WHERE id = ?`;
    updateValues.push(personId);

    db.run(sql, updateValues, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ message: "Person ikke funnet" });
            return;
        }
        res.json({ message: "Person oppdatert" });
    });
});


app.delete('/hero/:id', (req, res) => {
    const personId = req.params.id;

    db.run(`DELETE FROM people WHERE id = ?`, [personId], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ message: "Person ikke funnet" });
            return;
        }
        res.json({ message: "Person slettet" });
    });
});






app.listen(port, () => {
    console.log(`Server kjører på http://localhost:${port}`);
});
