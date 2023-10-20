# Superhero API Dokumentasjon

Dette APIet gir deg muligheten til å håndtere en database med superhelter og deres tilknyttede lokasjoner.

## Endepunkter

### <span style="background-color: green; padding: 4px 6px; border-radius: 4px;">GET</span> /heroes

Henter en liste over alle superhelter.

Respons:

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

### <span style="background-color: green; padding: 4px 6px; border-radius: 4px;">GET</span> /heroes/:id

Henter en bestemt superhelt ved ID.

Parametere:

id: ID til superhelten du ønsker å hente.

Respons:

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

### <span style="background-color: green; padding: 4px 6px; border-radius: 4px;">POST</span> /add-hero

Legger til en ny superhelt.

Forespørselslegeme:

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

### <span style="background-color: green; padding: 4px 6px; border-radius: 4px;">PATCH</span> /hero/:id

Oppdaterer en eksisterende superhelt ved ID.

Parametere:

id: ID til superhelten du ønsker å oppdatere.
Forespørselslegeme:

```json
{
	"name": "Clark Kent",
	"alias": "Superman",
	"power": "Super strength, flight",
	"image": "updated_image_url",
	"age": 36
}
```

Respons:

```json
{
	"message": "Person oppdatert"
}
```

### <span style="background-color: red; padding: 4px 6px; border-radius: 4px;">DELETE</span> /hero/:id

Sletter en superhelt ved ID.

Parametere:

id: ID til superhelten du ønsker å slette.
Respons:

```json
{
	"message": "Person slettet"
}
```

Serveren kjører på http://92.220.233.201:3000
