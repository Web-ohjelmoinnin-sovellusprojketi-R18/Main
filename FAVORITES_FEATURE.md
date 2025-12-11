# Suosikkilistan jakaminen URL-osoitteella

## Ominaisuuden kuvaus

Tämä ominaisuus mahdollistaa kirjautuneiden käyttäjien suosikkilistojen jakamisen URL-osoitteen kautta. Suosikkilista näytetään kaikille käyttäjille, jotka käyttävät jaettua linkkiä.

## Toiminnallisuus

### Käyttäjälle

1. **Elokuvien lisääminen suosikkeihin**
   - Hae elokuvia käyttämällä hakutoimintoa tai "Nyt elokuvissa" -nappia
   - Klikkaa "Lisää suosikkeihin" -nappia haluamasi elokuvan kohdalla
   - Elokuva lisätään automaattisesti omaan suosikkilistaan

2. **Suosikkilistan näyttäminen**
   - Klikkaa "Näytä omat suosikit" -nappia
   - Näet listan kaikista suosikkielokuvistasi
   - Voit poistaa elokuvia listasta klikkaamalla "Poista suosikeista"

3. **Suosikkilistan jakaminen**
   - Kun omat suosikkisi ovat näkyvissä, klikkaa "Kopioi jaettava linkki" -nappia
   - Linkki kopioidaan leikepöydälle
   - Jaa linkki kenen kanssa tahansa - he voivat nähdä suosikkilistasi

4. **Toisen käyttäjän suosikkilistan katselu**
   - Syötä käyttäjän ID "Näytä käyttäjän suosikkilista" -kenttään
   - Klikkaa "Näytä suosikit"
   - Näet kyseisen käyttäjän julkisen suosikkilistan
   - Tai avaa jaettu URL suoraan selaimessa (esim. `?favorites=1`)

## API-endpointit

### POST /api/favorites
Lisää elokuvan suosikkeihin.

**Request body:**
```json
{
  "userId": 1,
  "tmdbId": 550,
  "title": "Fight Club",
  "posterUrl": "https://...",
  "releaseDate": "1999-10-15",
  "overview": "..."
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "favorite": {
    "id": 1,
    "created_at": "2025-12-11T12:00:00Z"
  }
}
```

### DELETE /api/favorites/:movieId?userId=X
Poistaa elokuvan suosikeista.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Favorite removed"
}
```

### GET /api/favorites?userId=X
Hakee käyttäjän omat suosikit (vaatii autentikoinnin).

**Response:** `200 OK`
```json
{
  "favorites": [
    {
      "id": 1,
      "movie_id": 2,
      "tmdb_id": 550,
      "title": "Fight Club",
      "poster_url": "https://...",
      "release_date": "1999-10-15",
      "overview": "...",
      "created_at": "2025-12-11T12:00:00Z"
    }
  ]
}
```

### GET /api/favorites/public/:userId
Hakee käyttäjän julkisen suosikkilistan (ei vaadi autentikointia).

**Response:** `200 OK`
```json
{
  "username": "testuser1",
  "userId": 1,
  "favorites": [
    {
      "tmdb_id": 550,
      "title": "Fight Club",
      "poster_url": "https://...",
      "release_date": "1999-10-15",
      "overview": "..."
    }
  ]
}
```

## Tietokannan rakenne

### Taulut

**users**
- id (SERIAL PRIMARY KEY)
- username (VARCHAR(100) UNIQUE)
- password_hash (TEXT)
- created_at (TIMESTAMP)

**movies**
- id (SERIAL PRIMARY KEY)
- tmdb_id (INTEGER) - TMDB API:n elokuva-ID
- title (VARCHAR(255))
- poster_url (TEXT)
- release_date (DATE)
- overview (TEXT)

**favorites**
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER, FOREIGN KEY -> users.id)
- movie_id (INTEGER, FOREIGN KEY -> movies.id)
- created_at (TIMESTAMP)
- UNIQUE(user_id, movie_id) - Estää duplikaatit

## URL-parametrit

Sovellus tukee seuraavaa URL-parametria:

- `?favorites=<userId>` - Näyttää automaattisesti käyttäjän julkisen suosikkilistan

Esimerkki: `http://localhost:3000/?favorites=1`

## Turvallisuus

### Toteutettu
- ✅ SQL-injektiosuojaus parametrisoiduilla kyselyillä
- ✅ Syötteiden validointi kaikissa endpointeissa
- ✅ Virheenkäsittely ilman herkkien tietojen paljastamista
- ✅ Julkisen/yksityisen sisällön hallinta

### Puutteet
- ❌ Rate limiting puuttuu (koskee kaikkia API-reittejä)
- ❌ Oikea autentikointijärjestelmä (käytetään userId-simulointia)
- ❌ CSRF-suojaus
- ❌ XSS-suojaus Content Security Policy:llä

**Huomio:** Tämä on demo/kehitysversio. Tuotantokäyttöön tarvitaan oikea autentikointijärjestelmä.

## Testikäyttäjät

Tietokannassa on kolme testikäyttäjää:
- testuser1 (id: 1)
- testuser2 (id: 2)
- testuser3 (id: 3)

Käytä näitä käyttäjä-ID:itä testataksesi toiminnallisuutta.

## Kehitysideoita

1. Lisää oikea autentikointijärjestelmä JWT-tokeneilla
2. Implementoi rate limiting kaikille API-reitteille
3. Lisää suosikkilistojen nimeäminen ja kuvaukset
4. Mahdollista useiden suosikkilistojen luominen
5. Lisää yksityisyysasetukset (julkinen/yksityinen lista)
6. Lisää suosikkilistojen hakutoiminto
7. Implementoi suosituimpien listojen näyttäminen
