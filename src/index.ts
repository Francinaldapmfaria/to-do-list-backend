import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'


//fazer o import do knex

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {

        // const result = await db.select("*"). from("users") //mesma coisa que o de baixo
        const result = await db("users") //busca no banco de dados por todos os itens da tabela
        res.status(200).send({ message: "Pong!" })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }

