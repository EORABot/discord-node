const colors = require('colors')
const moment = require('moment')

colors.setTheme({
    title: ['bold', 'underline'],
    nicknameStyle: ['bold', 'underline'],
    error: ['white', 'bgRed'],
    warning: ['bold', 'black', 'bgYellow'],
    log: ['bgGreen', 'white'],
    property: ['bgGreen', 'white', 'bold']
})
const separator = '----------------------------'.bold.red

const title = (title) => {
    console.log(`[${moment(new Date()).format('H:mm:ss').magenta}][${title.title}]`)
}

module.exports = {
    colors,
    title,
    separator
}