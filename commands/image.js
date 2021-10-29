const {RichEmbed, Attachment} = require('discord.js')
var Scraper = require('images-scraper');
const { type } = require('os');

const google = new Scraper({
    puppeteer: {
        headless: true
    }
})

module.exports = {
    name: 'image',
    aliases: ['wao', 'w'],
    description: 'This sends an image to a text channel',
    async execute(message, args, cmd, client){
        if(cmd === 'wao' || cmd === 'w'){
            const imageResults = await google.scrape('dog', 100);
            return message.channel.send(imageResults[Math.floor(Math.random() * 100) + 1].url)
        } else if(cmd === 'image'){
            const imageQuery = args.join(' ');
            if(!imageQuery) return message.channel.send('Please enter an image name.');
    
            const imageResults = await google.scrape(imageQuery, 100);
            message.channel.send(imageResults[Math.floor(Math.random() * 100) + 1].url)
        }
    }
}