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
var comandos_backup = {
    "comandos" : async (msg, bot, whatsapp)=>{
        bot.sendMessage(msg.from,
            `".ficha"\n`+
            `"Informações sobre o seu personagem"\n\n`+
            `".listar (pessoas, feiticos, arquivos, lugares)"\n`+
            `"Mostra os elementos dentro de um grupo"\n\n`+
            `".consultar (isqueiro/Betsabé)"\n`+
            `"Mostra a descrição de um elemento"\n\n`+
            `".audio (augh, pegar, sexo, violino)"\n`+
            `"Toca o audio escolhido"\n\n`+
            `".enviar (numero) (arquivo)"\n`+
            `"Envia um arquivo que pode ser mp3 ou mp4 para o numero escolhido (contando com o ddd)"`)
    },

    "listar" : async (msg, bot, whatsapp)=>{
        var comando = msg.body.toLowerCase().split(' ')[1]
        var numero = (await contato(msg)).numero
        texto = msg.body.toLowerCase().split(' ')[2]

        var lista = []
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

        var comandoSelecionado= lista.find(e=>comando.startsWith(e.nome)).func
        if(comandoSelecionado) {
            try{
                comandoSelecionado()
            }catch (e){
                console.log(e);
                msg.reply("Ocorreu um erro!")
            }
        }else{
            msg.reply("Lista nao encontrada!")
        }
    },
    "ficha" : async (msg, bot, whatsapp)=>{ 
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
    },

    "consultar" :  async (msg, bot, whatsapp)=>{
        var Lista=listar("Players").concat(listar("Povoado"),listar("Rollenspiel"),listar("Feiticos"));
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
    },

    "erro" : ()=>{
        throw "Teste de erro"
    },

    "adicionar" :   (msg)=>{
        var comando = msg.body.toLowerCase().split(' ')[1]
        var input = msg.body.split(' ').filter((_,i)=>i>1).join(' ')
        if(comando == "pessoas"){
            var listaInput = input.split(" | ")

            if(!listaInput[0]) return msg.reply("É preciso adicionar alguma coisa!")

            var obj = {
                id : listaInput[0],
                nome : listaInput[1] || "",
                titulo : listaInput[2] || "",
                idade : listaInput[3] || "",
                descricao : listaInput[4] || "",
                imagem : listaInput[5] || ""
            }

            fs.writeFileSync("./Dados/Extra/"+obj.id + ".json", JSON.stringify(obj, null, 4), "utf8")
        }
        
    },

    "audio" : async (msg, bot, whatsapp)=>{
        var texto = msg.body.toLowerCase().split(' ')[1];
        try{
            var audio = await whatsapp.MessageMedia.fromFilePath("./Dados/Audios/"+texto+".mp3")
            await bot.sendMessage(msg.from,audio,{ sendAudioAsVoice: true })
        }catch{
            await bot.sendMessage(msg.from,"Não encontrado")
        }
        
    },

    "enviar" : async (msg, bot, whatsapp)=>{
        var numero = msg.body.split(' ')[1];
            numero = numero.startsWith('@') ? numero.replace("@","") : numero
            numero = numero.includes('@g.us') ? numero :
            numero = numero.includes('@c.us') ? numero : `${numero}@c.us`;

        var texto = msg.body.split(' ')[2];
        try{
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
    }

}
/*comandos["env"] = comandos["envi"] = comandos["envia"] = comandos["enviar"]
comandos["tocar"] = async (msg, bot, whatsapp)=>{
    msg.reply("toquei")
}*/

/*lista.adicionarComandos("com","",async()=>{
    msg.reply(lista.map(e=>e.nome + " - " + e.desc).join("\n"))
})*/

/*comandos["comandos2"] = async (msg, bot, whatsapp)=>{
    var lista = Object.keys(comandos)
    msg.reply(lista.join("\n"))
}*/
