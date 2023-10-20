const express = require('express');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Koblet til SQLite-databasen.');
});

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


db.run(`
    CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY,
        city TEXT NOT NULL,
        country TEXT NOT NULL
    )
`, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("locations-tabellen opprettet");
});

db.run(`
    CREATE TABLE IF NOT EXISTS people (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        alias TEXT,
        power TEXT,
        image TEXT,
        age INTEGER,
        location_id INTEGER,
        FOREIGN KEY (location_id) REFERENCES locations(id)
    )
`, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("people-tabellen opprettet");
});

// Fyll locations-tabellen først
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
            console.error(err.message);
            return;
        }
        const locationId = this.lastID;

        // Basert på locationId, legg til superhelter i people-tabellen
        switch (location.city) {
            case "Metropolis":
                db.run(`INSERT INTO people (name, alias, power, image, age, location_id) VALUES (?, ?, ?, ?, ?, ?)`, ["Clark Kent", "Superman", "Super strength, flight", "superman_image_url", 35, locationId]);
                break;
            case "Gotham":
                db.run(`INSERT INTO people (name, alias, power, image, age, location_id) VALUES (?, ?, ?, ?, ?, ?)`, ["Bruce Wayne", "Batman", "Genius intellect, peak human physical condition", "batman_image_url", 40, locationId]);
                break;
            case "Themyscira":
                db.run(`INSERT INTO people (name, alias, power, image, age, location_id) VALUES (?, ?, ?, ?, ?, ?)`, ["Diana Prince", "Wonder Woman", "Super strength, agility, lasso of truth", "wonderwoman_image_url", 5000, locationId]);
                break;
            case "Asgard":
                db.run(`INSERT INTO people (name, alias, power, image, age, location_id) VALUES (?, ?, ?, ?, ?, ?)`, ["Thor Odinson", "Thor", "God of thunder, Mjölnir", "thor_image_url", 1500, locationId]);
                break;
            case "New York":
                db.run(`INSERT INTO people (name, alias, power, image, age, location_id) VALUES (?, ?, ?, ?, ?, ?)`, ["Peter Parker", "Spider-Man", "Wall-crawling, spider sense", "spiderman_image_url", 22, locationId]);
                break;
        }
    });
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


app.post('/add-hero', (req, res) => {
    const { name, alias, power, image, age, city, country } = req.body;

    // Først, sjekk om byen allerede eksisterer i 'locations'-tabellen
    db.get(`SELECT id FROM locations WHERE city = ? AND country = ?`, [city, country], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        let locationId;
        if (row) {
            locationId = row.id;
        } else {
            // Hvis byen ikke eksisterer, legg den til i 'locations'-tabellen
            db.run(`INSERT INTO locations (city, country) VALUES (?, ?)`, [city, country], function (err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                locationId = this.lastID;
            });
        }

        // Legg til personen i 'people'-tabellen med den hentede eller nyopprettede 'location_id'
        db.run(`INSERT INTO people (name, alias, power, image, age, location_id) VALUES (?, ?, ?, ?, ?, ?)`, [name, alias, power, image, age, locationId], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: "Person lagt til!" });
        });
    });
});

app.patch('/hero/:id', (req, res) => {
    const personId = req.params.id;
    const { name, alias, power, image, age } = req.body;

    db.run(`UPDATE people SET name = ?, alias = ?, power = ?, image = ?, age = ? WHERE id = ?`, [name, alias, power, image, age, personId], (err) => {
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
