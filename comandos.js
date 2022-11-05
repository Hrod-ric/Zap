const fs = require("fs")
const listar = (pasta)=>{
    var Lista = fs.readdirSync("./Dados/"+pasta).map(p=>JSON.parse(fs.readFileSync("./Dados/"+pasta+"/"+p)));
    return Lista;
}
const contato = async (msg)=>{
    var chat = await msg.getChat()
    var contato = await msg.getContact();
    var numero = contato.id.user;
        numero = numero.includes('@c.us') ? numero : `${numero}@c.us`;
    return {chat,numero,contato};
}
module.exports = {
    "comandos" : async (msg, bot, whatsapp)=>{
        bot.sendMessage(msg.from,
            `".ficha"\n`+
            `"Informações sobre o seu personagem"\n\n`+
            `".listar (pessoas, feiticos, arquivos)"\n`+
            `"Mostra os nomes de um dos grupos"\n\n`+
            `".populacao (povoado)"\n`+
            `"Mostra os habitantes de um lugar"\n\n`+
            `".consultar (isqueiro/Betsabé)"\n`+
            `"para pesquisar um elemento e receber a descricao"\n`+
            `".augh"\n`+
            `".pegar"\n`+
            `".sexo"\n`+
            `".violino"\n`+
            `".enviar (numero) (arquivo)"`)
    },

    "listar" : async (msg, bot, whatsapp)=>{
        var texto = msg.body.toLowerCase().split(' ')[1]
        var numero = (await contato(msg)).numero
        try{
            if(texto == "pessoas"){
                texto = msg.body.toLowerCase().split(' ')[2]
                if(texto){
                    var String= "População do "+texto+"\n- " + listar(texto).map(p=>p.nome).join("\n- ");
                    msg.reply("Enviado!")
                    await bot.sendMessage(numero, String)
                    return
                }
                var String = "Lista de Pessoas"+
                "\n\nPlayers\n- " + listar("Players").map(p=>p.nome).join("\n- ") + 
                "\n\nPovoado\n- " + listar("Povoado").map(p=>p.nome).join("\n- ") +
                "\n\nRollenspiel\n- " + listar("Rollenspiel").map(p=>p.nome).join("\n- ")
                msg.reply("Enviado!")
                await bot.sendMessage(numero, String)
            }
            
            else if(texto == "feiticos"){
                texto = msg.body.toLowerCase().split(' ')[2]
                if(texto){
                    var String= "Feiticos de "+texto+"\n- " + listar(texto).map(p=>p.nome).join("\n- ");
                    msg.reply("Enviado!")
                    await bot.sendMessage(numero, String)
                    return
                }
                var String = "Lista de Feiticos\n- " + listar("Feiticos").map(p=>p.nome).join("\n- ")
                msg.reply("Enviado!")
                await bot.sendMessage(numero, String)
            }
            
            else if(texto == "arquivos"){
                //var String = "Lista de Arquivos\n- " + listar("Imagens").map(p=>p.nome).join("\n- ")
                var String = "Lista de Arquivos\nAudios:\n- augh.mp3\n- pegar.mp3\n- sexo.mp3\n- violino.mp3\n\nVideos:\n- 1.mp4\n- 2.mp4\n- 3.mp4\n- 4.mp4\n- a.mp4"
                msg.reply("Enviado!")
                await bot.sendMessage(numero, String)
            }
            
            else{
                await bot.sendMessage(msg.from, "a opção escolhida nao existe, escolha entre: pessoas, feiticos, arquivos ou o nome de um lugar")
            }
        }catch{
            await bot.sendMessage(msg.from,"erro!")
        }

    },

    "ficha" : async (msg, bot, whatsapp)=>{ 
        var Players=listar("Players")
        var numero = (await contato(msg)).numero
        var chat = (await contato(msg)).chat
        var encontrou = Players.find(p=>p.contato == numero.replace("@c.us",""));
        console.log(chat.id.user);
        if(encontrou){
            msg.reply("Enviado!")
            await bot.sendMessage(numero, 
                `Nome: ${encontrou.nome} \n`+
                `Idade: ${encontrou.idade}`+
                `${encontrou.descricao?"\nDescrição: "+encontrou.descricao:""}`+
                `${encontrou.habPassivas?"\nHabilidades Passivas: "+encontrou.habPassivas.join(", "):""}`+
                `${encontrou.feiticosAprendidos?"\nFeitiços Aprendidos: "+encontrou.feiticosAprendidos.join(", "):""}`)
        }
    },

    "consultar" :  async (msg, bot, whatsapp)=>{
        var Lista=listar("Players").concat(listar("Povoado"),listar("Rollenspiel"),listar("Feiticos"));
        //var texto = msg.body.toLowerCase().slice(11);
        var comando = msg.body.split(' ')[0];
        var indice = msg.body.indexOf(comando) + comando.length;
        var texto = msg.body.slice(indice+1, msg.body.length);
        //console.log(message);
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
        var input = msg.body.toLowerCase().split(' ')[1]
        if(input == "pessoas"){
            var Lista = listar("Extra")
        }
        
    },

    "audio" : async (msg, bot, whatsapp)=>{
        var texto = msg.body.split(' ')[1];
        try{
            var audio = await whatsapp.MessageMedia.fromFilePath("./Dados/Imagens/"+texto+".mp3")
            await bot.sendMessage(msg.from,audio,{ sendAudioAsVoice: true })
        }catch{
            await bot.sendMessage(msg.from,"Não encontrado")
        }
    },

    "enviar" : async (msg, bot, whatsapp)=>{
        var numero = msg.body.split(' ')[1];
            numero = numero.includes('@g.us') ? numero :
            numero = numero.includes('@c.us') ? numero : `${numero}@c.us`;
        var texto = msg.body.split(' ')[2];
        try{
            var video = await whatsapp.MessageMedia.fromFilePath("./Dados/Imagens/"+texto)
            if(texto.includes(".mp4")){
                await bot.sendMessage(numero, video, { sendVideoAsGif: true })    
            }else if(texto.includes(".mp3")){
                await bot.sendMessage(numero, video, { sendAudioAsVoice: true })
            }
        }catch{
            await bot.sendMessage(msg.from, "nao encontrado")
        }       
    }

}