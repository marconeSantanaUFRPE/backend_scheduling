const banco = require("./models/Mysql")
const express = require("express")
const bodyParser = require("body-parser")
const app = express()


app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

var porta = process.env.PORT || 8089;

app.listen(porta, function(){
    console.log("Rodandoo API")
})

app.get('/',(req,res)=>{

    res.render("index.ejs")

})

app.get('/ln', (req, res)=>{

    res.render('login.ejs')

})

app.get('/rg', (req, res)=>{

    res.render('reg.ejs')

})


app.post("/login", async(req,res)=>{

    var email_formulario = req.body["email"];
    var senha_formulario = req.body["senha"];
    
    var id_banco;
    var email_banco;
    var senha_banco;
    var continha;
    
    var conta = await pegarusuario(email_formulario)
    
    if (conta.length != 0){
        
        var id_banco = conta[0]["id"]
        var email_banco = conta[0]["email"];
        var senha_banco = conta[0]["senha"];
        var dataCriacao = conta[0]["data_criacao"];

        if(senha_banco == senha_formulario){

        continha = {"Erro":false,"id":id_banco,"email":email_banco,"senha":senha_banco,"dataCriacao":dataCriacao}
        res.send(continha)
    }
    else{ 

        continha = {"Erro":true,"mensagem":'Usuario ou senha incorretos'}
        res.send(continha);
        
     }

}

    else {

        console.log("Usuario não Existe")
        continha = {"Erro":true, "mensagem":"Usuario ou senha incorretos"}    
        res.send(continha)
    }
    
    
    })


app.post("/cadastrar", async (req,res) =>{

    var email_formulario = req.body["email"];
    var senha_formulario = req.body["senha"];


    var verificarCont =  await pegarusuario(email_formulario);
    
    if(verificarCont.length!=0){

    if(verificarCont[0]["email"] == email_formulario){

        res.send({"resposta":"EMAIL JÁ CADASTRADO"})

    }else{

        var conta = await inserirUsuario(email_formulario,senha_formulario)
        res.send({"resposta":"Cadastro Realizado"})
    }
}else{

    var conta = await inserirUsuario(email_formulario,senha_formulario)
        res.send({"resposta":"Cadastro Realizado"})
    

}


})


app.post("/cadastrarAtividade", async (req,res) =>{

    var nome = req.body["nome"];
    var descricao = req.body["descricao"];
    var data_inicio = req.body["data_inicio"];
    var data_termino = req.body["data_termino"];
    var status = req.body["status"];
    var usuario_id = req.body["usuarioId"];
    


    var atividade = await inserirAtividade(nome,descricao,data_inicio,data_termino,status,usuario_id)
    var idNova = atividade[0]["insertId"]

    res.send({"resposta":"Atividade Cadastrada", "idnova":idNova})

})



app.post("/atividades" , async (req,res)=>{

    usuarioId = req.body["usuarioId"]
    
    var atividades = await pegarAtiviades(usuarioId)
    var quantidade = atividades.length


    res.send({"atividades":atividades, "quantidade":quantidade})

    

})


app.post("/atividadesDoDia" , async (req,res) =>{

    //var usuarioId = req.body["usuarioId"]
    //var lista_datas = req.body["listaDeDatas"]

    var listaDeDatas = ["00/00/01"];
    var usuarioId = 1;

    var  atividade_termino = await pegarAtiviadesData(usuarioId,listaDeDatas,"data_termino");
    var  atividade_do_dia = await pegarAtiviadesData(usuarioId,listaDeDatas,"data_inicio");
    res.send({atividade_do_dia,atividade_termino})
})



app.post("/apagarConta", async (req,res)=>{

    var usuarioId = req.body["usuarioId"];

    var apagar = await apagarUsuarioPeloId(usuarioId);

    res.send({"resposta":"Conta Excluida"})

})

app.post("/updateConta/Email", async (req,res)=>{})

app.post("/apagarAtividades", async (req,res)=>{

    var usuarioId = req.body["atividadeId"];
    var apagar = await apagarAtividadePeloId(usuarioId);

    res.send({"resposta":"Atividade Excluida"})



})




app.post("/updateAtividade/Status", async (req,res)=>{

    var idAtividade = req.body["atividadeId"]
    var atualizacao = req.body["atualizacao"]
    var atualizar = await atualizarAtividade(idAtividade,atualizacao);


    res.send({"mensagem":"Status de Atividade Atualizada"})
})








//Funções


async function verificarConta(email){


    query = "SELECT email FROM usuario WHERE email='"+email+"';"

    resultado = await fazerQuery(query)

    return resultado

}




async function atualizarAtividade(idAtividade,atualizacao){

    connection = banco();
    var query = "UPDATE atividade set status_atividade ='"+atualizacao+"' WHERE id="+idAtividade+";"

    var resultado = await fazerQuery(query,connection);


    return resultado
}




async function atividadeNova(nome){

   var query = "SELECT id FROM atividade WHERE nome='"+nome+"';"
    connection = banco();

    var resposta = await fazerQuery(query,connection)

    return resposta

}


async function apagarAtividadePeloId(atividadeId){
    var connection = banco()

    var query = "DELETE FROM atividade WHERE id="+atividadeId+";" 

    var resultado = await fazerQuery(query,connection);
    return resultado


}


async function apagarUsuarioPeloId(usuarioId){

    var connection = banco()

    var query = "DELETE FROM usuario WHERE usuario.id="+usuarioId+";"


    var resultado = await fazerQuery(query,connection);
    return resultado

}


async function pegarAtiviadesData(usuarioId,listaDeDatas, string){

    var listaAtividadeFinal = []
    var connection = banco()

    for(var datas in listaDeDatas){


        var query = "SELECT * FROM atividade WHERE usuario_id='"+usuarioId+"'"+" and "+string+"='"+listaDeDatas[datas]+"';"

        console.log(datas)
        console.log(query)
        var atividade_do_dia = await fazerQuery(query,connection)
        listaAtividadeFinal.push(atividade_do_dia[0])


    }

    return listaAtividadeFinal

}



async function pegarAtiviades(usuarioId){

    var connection = banco()
    
    

    var query = "SELECT * FROM atividade WHERE usuario_id='"+usuarioId+"';"

    var atividades  = await fazerQuery(query,connection)

    //fazer as atividades sairem json
    var jsonAtividades  = atividades[0];
    //console.log(jsonAtividades.length)
    return jsonAtividades

}



   


async function inserirAtividade(nome,descricao,data_inicio,data_termino,status,usuario_id){

    var connection = banco()
var query = "INSERT INTO atividade (nome,descricao,data_inicio,data_termino,status_atividade,usuario_id) values ('"+nome+"','"+descricao+"','"+data_inicio+"','"+data_termino+"','"+status+"','"+usuario_id+"');"

    var resultado = await fazerQuery(query,connection)

    return resultado

}


async function inserirUsuario(email_formulario,senha_formulario){
  
    var data = new Date();
    var dia = data.getDate()
    var mes = data.getMonth()
    var ano = data.getFullYear()
    
    var str_data = dia+"/"+mes+"/"+ano;
    console.log(str_data)


    var data_criacao = "";
    var connection = banco()
    var query = "INSERT INTO usuario (email,senha,data_criacao) VALUES('" +email_formulario+"'"+","+"'" +senha_formulario+"'"+","+"'"+str_data+"')"

    var resultado = await fazerQuery(query,connection)

    return resultado

}

async function pegarusuario  (email_formulario){

    var connection =  banco()
    
    
    var query = "SELECT id,email,senha,data_criacao FROM usuario WHERE usuario.email ='"+email_formulario+"';";
            
    var conta = await fazerQuery(query, connection)
            
    var lista = conta[0]
        return (lista)       
            
}



async function fazerQuery(query,connection){

    const result = connection.query(query);
    return result
    
}
