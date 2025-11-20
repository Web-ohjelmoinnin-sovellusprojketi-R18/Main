import express from 'express'
import cors from 'cors'
import pkg from 'pg'

const port = 3001
const { Pool } = pkg

const app = express()
app.use(cors())

app.get('/', (req, res) => {
    res.status(200).json({result: "Success"})
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
