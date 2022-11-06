const fs = require("fs")
const listar = (pasta)=>{
    var Lista = fs.readdirSync("./Dados/"+pasta).map(p=>JSON.parse(fs.readFileSync("./Dados/"+pasta+"/"+p)));
    return Lista;
}
Array.prototype.adicionarComandos = function(nome, desc,func){
    this.push({nome, desc, func})
    return this
}
const contato = async (msg)=>{
    var chat = await msg.getChat()
    var contato = await msg.getContact();
    var numero = contato.id.user;
        numero = numero.includes('@c.us') ? numero : `${numero}@c.us`;
    return {chat,numero,contato};
}

const misto = (texto)=>{
    //const regExp = /(\nome:)(.*)(\n|\.)/i
    //const re = new RegExp(`${parametro}` + `(.*)(\n|\.)`, 'i');
    const re = /(?<=\n)(.*)(:)(.*)(?<=\.)/gi
    const textoSelecionado = texto.match(re)
    var atributos = textoSelecionado.map(p=>p.split(":")[0])
    var valores = textoSelecionado.map(p=>p.split(":")[1].replace(".","").substring(1))
    var input = `{ 
        ${atributos.map((e, i)=>`"` + e + `"`+ " : " + `"`+ valores[i]+`"`).join(", ")}
    }`
    var obj = JSON.parse(input)
    return obj;
}

var comandos = []
comandos.adicionarComandos("comandos","mostrar comandos",async (msg, bot, whatsapp)=>{
    msg.reply(comandos.map(e=>e.nome+" - "+e.desc).join("\n"))
})

//Listar
comandos.adicionarComandos("listar","Mostra os elementos dentro de um grupo",async (msg, bot, whatsapp)=>{
    var comando = msg.body.toLowerCase().split(' ')[1]
    var numero = (await contato(msg)).numero
    texto = msg.body.toLowerCase().split(' ')[2]

    var lista = []

    //Pessoas
    lista.adicionarComandos("pes","mo",async()=>{
        if(texto){
            var String= "População do "+texto+"\n- " + listar(texto).map(p=>p.nome).join("\n- ");
            await bot.sendMessage(numero, String)
            msg.reply("Enviado!")
            return
        }
        var String =    "Lista de Pessoas"+
                        "\n\nPlayers\n- " + listar("Players").map(p=>p.nome).join("\n- ") + 
                        "\n\nPovoado\n- " + listar("Povoado").map(p=>p.nome).join("\n- ") +
                        "\n\nRollenspiel\n- " + listar("Rollenspiel").map(p=>p.nome).join("\n- ")
        await bot.sendMessage(numero, String)
        msg.reply("Enviado!")
    })

    //Feitiços
    lista.adicionarComandos("fei","my",async()=>{
        if(texto){
            var String= "Feiticos de "+texto+"\n- " + listar(texto).map(p=>p.nome).join("\n- ");
            await bot.sendMessage(numero, String)
            msg.reply("Enviado!")
            return
        }

        var String = "Lista de Feiticos\n- " + listar("Feiticos").map(p=>p.nome).join("\n- ")
        await bot.sendMessage(numero, String)
        msg.reply("Enviado!")
    })
    
    //Arquivos
    lista.adicionarComandos("arq","mu",async()=>{
        if(texto){
            var String= "Lista de Arquivos\n"
                        +texto+"\n- " + fs.readdirSync("./Dados/"+texto).map(p=>p).join("\n- ")
            await bot.sendMessage(numero, String)
            msg.reply("Enviado!")
            return
        }

        var String =    "Lista de Arquivos"+
                        "\n\nImagens\n- " + fs.readdirSync("./Dados/Imagens").join("\n- ") +
                        "\n\nAudios\n- " + fs.readdirSync("./Dados/Audios").join("\n- ") +
                        "\n\nVideos\n- " + fs.readdirSync("./Dados/Videos").join("\n- ")

        await bot.sendMessage(numero, String)
        msg.reply("Enviado!")
    })

    //Comando
    var comandoSelecionado= lista.find(e=>comando.startsWith(e.nome))
    if(comandoSelecionado) {
        try{
            comandoSelecionado.func()
        }catch (e){
            console.log(e);
            msg.reply("Ocorreu um erro!")
        }
    }else{
        msg.reply("Lista nao encontrada!")
    }
})

//Ficha
comandos.adicionarComandos("ficha","Informações sobre o seu personagem",async (msg, bot, whatsapp)=>{ 
    var Players=listar("Players")
    var numero = (await contato(msg)).numero
    var chat = (await contato(msg)).chat
    var encontrou = Players.find(p=>p.contato == numero.replace("@c.us",""));
    if(encontrou){
        await bot.sendMessage(numero, 
            `Nome: ${encontrou.nome} \n`+
            `Idade: ${encontrou.idade}`+
            `${encontrou.descricao?"\nDescrição: "+encontrou.descricao:""}`+
            `${encontrou.habPassivas?"\nHabilidades Passivas: "+encontrou.habPassivas.join(", "):""}`+
            `${encontrou.feiticosAprendidos?"\nFeitiços Aprendidos: "+encontrou.feiticosAprendidos.join(", "):""}`)
        }
        msg.reply("Enviado!")
})

//Consultar
comandos.adicionarComandos("consultar","Mostra a descrição de um elemento",async (msg, bot, whatsapp)=>{
    var Lista=listar("Players").concat(listar("Povoado"),listar("Rollenspiel"),listar("Feiticos"),listar("Extra"));
    var texto = msg.body.toLowerCase().split(' ').filter((_,i)=>i).join(" ")
    var encontrou = Lista.find(p=>p.id == texto);

    try{

        if(encontrou.imagem){
            var imagem = await whatsapp.MessageMedia.fromFilePath("./Dados/Imagens/"+encontrou.imagem)
            if(encontrou.imagem.includes(".mp4")){
                await bot.sendMessage(msg.from,imagem,{ sendVideoAsGif: true });
            }else{
                await bot.sendMessage(msg.from,imagem)
            }
        }
        msg.reply(
            `Nome: ${encontrou.nome}`+
            `${encontrou.titulo?"\nConhecido como "+encontrou.titulo:"\nConhecido como "+encontrou.id}`+
            `${encontrou.descricao?"\nDescrição: "+encontrou.descricao:"\nSem descrição"}`
        )
    }catch{
        msg.reply("Não foi encontrado!")
    }
})

//Adicionar
comandos.adicionarComandos("adicionar","",async (msg)=>{
    var comando = msg.body.toLowerCase().split(' ')[1]
    var lista = []

    //Pessoas
    lista.adicionarComandos("pessoas","mo",async()=>{
        var pessoa =  misto(msg.body)
        if(!pessoa.id)return msg.reply("É preciso adicionar um id!")
    
        var Lista = listar("Extra");
        var encontrou = Lista.find(p=>p.id == pessoa.id);
        if(encontrou) return msg.reply("Essa pessoa ja foi adicionada!")
    
        fs.writeFileSync("./Dados/Extra/"+pessoa.id + ".json", JSON.stringify(pessoa, null, 4), "utf8")
        msg.reply("Pessoa criada " + pessoa.id)
    })

    //Comando
    var comandoSelecionado = lista.find(e=>comando.startsWith(e.nome))
    if(comandoSelecionado) {
        try{
            comandoSelecionado.func()
        }catch (e){
            console.log(e);
            msg.reply("Ocorreu um erro!")
        }
    }else{
        msg.reply("Categoria nao encontrada!")
    }
    
})

//Alterar
comandos.adicionarComandos("alterar","",(msg)=>{
    var comando = msg.body.toLowerCase().split(' ')[1]
    var lista = []

    //Ficha
    lista.adicionarComandos("ficha","mo",async()=>{
        var listas = listar("Players")
        var numero = (await contato(msg)).numero
        var encontrou = listas.find(e=>e.contato == numero.replace("@c.us",""))
        if(encontrou) msg.reply("mec")
    })

    //Pessoas
    lista.adicionarComandos("pessoas","mo",async()=>{
        var listas = listar("Extra")
        var texto = msg.body.toLowerCase().split(" ")[2]
        var pessoa = listas.find(e=>e.id == texto)
        if(pessoa){
            try{
                var obj = misto(msg.body)
                
                pessoa.nome = obj.nome? obj.nome : pessoa.nome
                pessoa.titulo = obj.titulo? obj.titulo : pessoa.titulo
                pessoa.idade = obj.idade? obj.idade : pessoa.idade
                pessoa.descricao = obj.descricao? obj.descricao : pessoa.descricao
                pessoa.imagem = obj.imagem? obj.imagem : pessoa.imagem
        
                fs.writeFileSync("./Dados/Extra/"+pessoa.id + ".json", JSON.stringify(pessoa, null, 4), "utf8")
                msg.reply("Pessoa alterada " + pessoa.id)
            }catch(e){
                msg.reply(e)
            }
        }else{
            msg.reply("Pessoa nao existe!")
        }
    })

    //Comando
    var comandoSelecionado = lista.find(e=>comando.startsWith(e.nome))
    if(comandoSelecionado) {
        try{
            comandoSelecionado.func()
        }catch (e){
            console.log(e);
            msg.reply("Ocorreu um erro!")
        }
    }else{
        msg.reply("Categoria nao encontrada!")
    }
})

//Audio
comandos.adicionarComandos("audio","",async (msg, bot, whatsapp)=>{
    var texto = msg.body.toLowerCase().split(' ')[1];
    try{
        var audio = await whatsapp.MessageMedia.fromFilePath("./Dados/Audios/"+texto+".mp3")
        await bot.sendMessage(msg.from,audio,{ sendAudioAsVoice: true })
    }catch{
        await bot.sendMessage(msg.from,"Não encontrado")
    }
    
})

//Enviar
comandos.adicionarComandos("enviar","",async (msg, bot, whatsapp)=>{
    try{
        var numero = msg.body.split(' ')[1];
            numero = numero.startsWith('@') ? numero.replace("@","") : numero
            numero = numero.includes('@g.us') ? numero :
            numero = numero.includes('@c.us') ? numero : `${numero}@c.us`;
    
        var texto = msg.body.split(' ')[2];

        if(texto.includes(".mp4")){
            var video = await whatsapp.MessageMedia.fromFilePath("./Dados/Videos/"+texto)
            await bot.sendMessage(numero, video, { sendVideoAsGif: true })    
        }else if(texto.includes(".mp3")){
            var video = await whatsapp.MessageMedia.fromFilePath("./Dados/Audios/"+texto)
            await bot.sendMessage(numero, video, { sendAudioAsVoice: true })
        }
    }catch{
        await bot.sendMessage(msg.from, "nao encontrado")
    }       
})

module.exports = comandos