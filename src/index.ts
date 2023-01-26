import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'
import { TUserDB } from './database/types'


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

})

app.get("/users", async (req: Request, res: Response) => {
    try {

        const searchTerm = req.query.q as string | undefined

            //aqui quer dizer que se tiver na query undefined vai retor
        if (searchTerm === undefined ){
            const result = await db("users") 
            res.status(200).send(result)
            //foi adicionado uma bsuca por nomes baseado na query params com o else
        }else {
            const result = await db("users").where("name", "LIKE", `%${searchTerm}%`)
            res.status(200).send(result)
        }

    
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

})

app.post("/users", async (req: Request, res: Response) => {
    try {

        // const id = req.body.id As string
        // const name = req.body.name
        // const email = req.body.email
        // const password = req.body.password

       // se fosse necessário tipar cada uma o ideal seria o de cima, mas como não é esse o caso pode ser a desetruturada

        const {id, name,email, password} = req.body 

        //validar o dados, no body é tudo obrigatório se algum deeles faltar signifcia que não poderá criar o usuário e 
        //poderá devolver um erro

        //validar todos os dados de entrada o maximo possivel e tipando tudo que vem do mundo externo

        if (typeof id !== "string")  {//! 0 false undefined null "" nan cairá nesse if
            res.status(400)
            throw new Error("'id' deve ser string ")
        }

        if(id.length <4){
            res.status(400)
            throw new Error("'id' deve possuir pelo menos 4 caracteres ")
        }

        if (typeof name !== "string"){
            res.status(400)
            throw new Error("'name' deve ser string ")
        }

        if(name.length <2){
            res.status(400)
            throw new Error("'name' deve possuir pelo menos 2 caracteres ")
        }

        if (typeof email !== "string"){
            res.status(400)
            throw new Error("'email' deve ser string ")
        }

        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g)) {
			throw new Error("'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial")
		}

       const [userIdAlredyExists]: TUserDB[] | undefined = await db("users").where({id})
       //sempre que for fazer um select da tabela de usuáris sabemos que vai retornar array de TUserDB
        if (userIdAlredyExists) {
           res.status(400)
           throw new Error("'id' ja existe")
        }

        const [userEmaildAlredyExists]: TUserDB[] | undefined = await db("users").where({email})
        if (userEmaildAlredyExists) {
           res.status(400)
           throw new Error("'email' ja existe")
        }

        const newUser: TUserDB = {
            id,
            name,
            email,
            password
        }

        await db("users").insert(newUser)
        res.status(201).send({message: "Usuário criado com sucesso",
        user:newUser})
    
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

})
