module.exports = async (client) =>{
    console.log(`${client.user.username} is online!`);
    client.user.setStatus('online');
    client.user.setActivity("!help", {type: "PLAYING"})
}