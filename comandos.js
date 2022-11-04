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
            `".listar (pessoas, feiticos)"\n`+
            `"Mostra os nomes de um dos grupos"\n\n`+
            `".populacao (povoado)"\n`+
            `"Mostra os habitantes de um lugar"\n\n`+
            `".consultar (isqueiro/Betsabé)"\n`+
            `"para pesquisar um elemento e receber a descricao"`)
    },
    "listar" : async (msg, bot, whatsapp)=>{
        var texto = msg.body.toLowerCase().split(' ')[1]
        var numero = (await contato(msg)).numero
        if(texto == "pessoas"){
            var String = "Lista de Pessoas"+
            "\n\nPlayers\n- " + listar("Players").map(p=>p.nome).join("\n- ") + 
            "\n\nPovoado\n- " + listar("Povoado").map(p=>p.nome).join("\n- ") +
            "\n\nRollenspiel\n- " + listar("Rollenspiel").map(p=>p.nome).join("\n- ")
            msg.reply("Enviado!")
            await bot.sendMessage(numero, String)
        }
        if(texto == "feiticos"){
            var String = "Lista de Feiticos\n- " + listar("Feiticos").map(p=>p.nome).join("\n- ")
            msg.reply("Enviado!")
            await bot.sendMessage(numero, String)
        }   
    },

    "ficha" : async (msg, bot, whatsapp)=>{ 
        var Players=listar("Players")
        var numero = (await contato(msg)).numero
        var chat = (await contato(msg)).chat
        var encontrou = Players.find(p=>p.contato == numero.replace("@c.us",""));
        //console.log(chat);
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

    "populacao" : async (msg, bot, whatsapp)=>{
        var texto = msg.body.toLowerCase().split(' ')[1]
        if(texto == "povoado"){
            var Pessoas= "População do povoado\n- " + listar("Povoado").map(p=>p.nome).join("\n- ");
            msg.reply(Pessoas);
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
                var imagem = await whatsapp.MessageMedia.fromFilePath("./Imagens/"+encontrou.imagem)
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
        
    }
}