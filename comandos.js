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
    "lista" : async (msg, bot, whatsapp)=>{
        var texto = msg.body.split(' ')[1]
        var numero = (await contato(msg)).numero
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
            await bot.sendMessage(numero, `Nome: ${encontrou.nome} \nIdade: ${encontrou.idade} ${encontrou.descricao?"\nDescrição: "+encontrou.descricao:""}${encontrou.habPassivas?"\nHabilidades Passivas: "+encontrou.habPassivas.join(", "):""}`)
        }
        else{
            msg.reply("Não encontrei!")
        }
        
    }
}