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
        try{
            texto = msg.body.toLowerCase().split(' ')[2]
            if(comando == "pessoas"){
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
            }
            
            else if(comando == "feiticos"){
                if(texto){
                    var String= "Feiticos de "+texto+"\n- " + listar(texto).map(p=>p.nome).join("\n- ");
                    await bot.sendMessage(numero, String)
                    msg.reply("Enviado!")
                    return
                }

                var String = "Lista de Feiticos\n- " + listar("Feiticos").map(p=>p.nome).join("\n- ")
                await bot.sendMessage(numero, String)
                msg.reply("Enviado!")
            }
            
            else if(comando == "arquivos"){
                if(texto){
                    var String= "Lista de Arquivos\n"
                                +texto+"\n- " + fs.readdirSync("./Dados/"+texto).map(p=>p).join("\n- ")
                    await bot.sendMessage(numero, String)
                    msg.reply("Enviado!")
                    return
                }

                var String =    "Lista de Arquivos"+
                                "\n\nImagens\n- " + fs.readdirSync("./Dados/Imagens").map(p=>p).join("\n- ") +
                                "\n\nAudios\n- " + fs.readdirSync("./Dados/Audios").map(p=>p).join("\n- ") +
                                "\n\nVideos\n- " + fs.readdirSync("./Dados/Videos").map(p=>p).join("\n- ")
                //console.log(String);
                await bot.sendMessage(numero, String)
                msg.reply("Enviado!")
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
        //console.log(chat.id.user);
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
        //var texto = msg.body.toLowerCase().slice(11);
        var comando = msg.body.toLowerCase().split(' ')[0]
        var indice = msg.body.indexOf(comando) + comando.length;
        var texto = msg.body.toLowerCase().slice(indice+1, msg.body.length);
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