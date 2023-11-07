# Superhero API Dokumentasjon

Denne NodeJS applikasjonen er designet for å håndtere en samling av superhelter og deres lokasjoner i en database. Den tillater brukere å opprette, hente, oppdatere, og slette informasjon om superhelter, samt administrere deres assosierte lokasjoner.
En SQLite-database med navn database.db og nødvendige tabeller (people, locations) må være opprettet og tilgjengelig i prosjektets rotkatalog.
Det er laget endepunkter for å kunne lage ny, tømme og fylle databasen med fiktiv data.
Ingen autorisasjon er satt opp for dette prosjektet.

## Oppsett

Node.js må være installert på systemet.
express og sqlite3 pakkene er inkludert i prosjektet og dette kan installeres via npm:

`npm install`

## Endepunkter

### <span style="background-color: green; color: black; padding: 4px 6px; border-radius: 4px;">GET</span> /create-database

- Lager tabellene people og location hvis de ikke eksisterer.
- Lukker databasetilkoblingen for å returere en tilbakemelding om at tabellene er opprettet eller ikke.

---

### <span style="background-color: red; color: black; padding: 4px 6px; border-radius: 4px;">DELETE</span> /clear-database

- Sletter people tabellen
- Sletter location tabellen
- Returnerer en tilbakemelding om at databasen er tømt eller en feilmelding dersom det ikke var mulig

---

### <span style="background-color: yellow; color: black; padding: 4px 6px; border-radius: 4px;">POST</span> /fill-database

- Fyller locations tabellen med et sett av forhåndsdefinerte lokasjoner og setter inn tilsvarende superhelter i people tabellen basert på lokasjonen.
- Returerer en melding om suksess.

---

### <span style="background-color: green; color: black; padding: 4px 6px; border-radius: 4px;">GET</span> /heroes

- Henter en liste over alle superhelter i people tabellen.
- Returerer en JSON-array av superhelter.

#### Respons:

```json
[
    {
        "id": 1,
        "name": "Clark Kent",
        "alias": "Superman",
        "power": "Super strength, flight",
        "image": "superman_image_url",
        "age": 35,
        "location_id": 1
    },
    ...
]
```

---

### <span style="background-color: green; color: black; padding: 4px 6px; border-radius: 4px;">GET</span> /heroes/:id

- Henter detaljer om en enkelt superhelt basert på ID.
- id er en parameter i URL-en som representerer superheltens ID.
- Returerer superheltens detaljer eller en feilmelding om ikke funnet.

#### Parametere:

- id: ID til superhelten du ønsker å hente.

#### Respons:

```json
{
	"id": 1,
	"name": "Clark Kent",
	"alias": "Superman",
	"power": "Super strength, flight",
	"image": "superman_image_url",
	"age": 35,
	"location_id": 1
}
```

---

### <span style="background-color: green; color: black; padding: 4px 6px; border-radius: 4px;">GET</span> /heroes-location/:id

- Henter detaljer om en enkelt superhelt basert på ID inkludert mer info fra location.
- id er en parameter i URL-en som representerer superheltens ID.
- Returerer superheltens detaljer eller en feilmelding om ikke funnet.

#### Forklaring på INNER JOIN

_p.\* velger alle kolonnene fra people-tabellen (prefikset med p som er aliaset gitt til tabellen people).
l.city, l.country velger city og country kolonnene fra locations-tabellen (prefikset med l som er aliaset gitt til tabellen locations)._

_INNER JOIN locations l ON p.location_id = l.id utfører en inner join mellom people og locations tabellene der location_id fra people matcher id i locations-tabellen.
Når denne spørringen kjøres, vil den returnere et objekt som inneholder all informasjon om helten, inkludert byen og landet deres, basert på location_id. Dette objektet vil da bli sendt tilbake som en JSON-respons til klienten._

#### Parametere:

- id: ID til superhelten du ønsker å hente.

#### Respons:

```json
{
	"id": 3,
	"name": "Diana Prince",
	"alias": "Wonder Woman",
	"power": "Super strength, agility, lasso of truth",
	"image": "https://upload.wikimedia.org/wikipedia/en/thumb/f/fd/Wonder_Woman_DC_Comics.png/220px-Wonder_Woman_DC_Comics.png",
	"age": 5000,
	"location_id": 3,
	"city": "Themyscira",
	"country": "Ukjent"
}
```

---

### <span style="background-color: yellow; color: black; padding: 4px 6px; border-radius: 4px;">POST</span> /add-hero

- Legger til en ny superhelt i databasen.
- Aksepterer JSON i request body med nødvendig informasjon om superhelten, og valgfritt om lokasjonen.
- Returerer en melding om suksess eller feil.

#### Forventet JSON:

```json
{
	"name": "Clark Kent",
	"alias": "Superman",
	"power": "Super strength, flight",
	"image": "superman_image_url",
	"age": 35,
	"city": "Metropolis",
	"country": "USA"
}
```

Respons:

```json
{
	"message": "Person lagt til!"
}
```

---

### <span style="background-color: orange; color: black; padding: 4px 6px; border-radius: 4px;">PATCH</span> /heroes/:id

- Oppdaterer informasjonen om en superhelt basert på ID.
- id er en parameter i URL-en som representerer superheltens ID.
- Aksepterer JSON i request body med feltene som skal oppdateres.
- Returerer en melding om suksess eller feil.

#### Parametere:

- id: ID til superhelten du ønsker å oppdatere.

#### Forventet JSON:

```json
{
	"name": "Clark Kent",
	"alias": "Superman",
	"power": "Super strength, flight",
	"image": "updated_image_url",
	"age": 36
}
```

#### Respons:

```json
{
	"message": "Person oppdatert"
}
```

---

### <span style="background-color: red; color: black; padding: 4px 6px; border-radius: 4px;">DELETE</span> /heroes/:id

- Sletter en superhelt fra databasen basert på ID.
- id er en parameter i URL-en som representerer superheltens ID.
- Returerer en melding om suksess eller feil om personen ikke finnes.

#### Parametere:

- id: ID til superhelten du ønsker å slette.

#### Respons:

```json
{
	"message": "Person slettet"
}
```

### Serverstart

Serveren startes ved å skrive følgende i terminalen:

`npm start`

Dette vil lytte på den angitte porten (standard 3000).
Du vil se en bekreftelse i terminalen som sier: `Server kjører på http://localhost:3000`
