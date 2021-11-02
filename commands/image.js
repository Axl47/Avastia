var Scraper = require('images-scraper');
const MessageEmbed = require('discord.js');

const google = new Scraper({
    puppeteer: {
        headless: true
    }
})

module.exports = {
    name: 'image',
    aliases: ['wao', 'w'],
    description: 'This sends an image to a text channel',
    async execute(message, args, cmd, client, Discord) {
        if(cmd === 'wao' || cmd === 'w'){
            const imageResults = await google.scrape('dog', 100);
            const newEmbed = new Discord.MessageEmbed()
                .setColor('#f22222')
                .setImage(imageResults[Math.floor(Math.random() * 100) + 1].url)
            
            return message.reply({ embeds: [newEmbed] });
        } else if(cmd === 'image'){
            const imageQuery = args.join(' ');
            if(!imageQuery) return message.channel.send('Please enter an image name.');
    
            const imageResults = await google.scrape(imageQuery, 100);
            const newEmbed = new Discord.MessageEmbed()
                .setColor('#f22222')
                .setImage(imageResults[Math.floor(Math.random() * 100) + 1].url)
            
            return message.reply({ embeds: [newEmbed] });
        }
    }
}