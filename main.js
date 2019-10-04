const express = require('express')
const socket = require('socket.io')
const http = require('http')
const fs = require('fs')

const app = express()
const server = http.createServer(app)
const io = socket(server)

app.use('/src', express.static('./src'))
app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))

var standby = []
var filteredstandby = []
var nextnum = 100

const logger = {
    info(text) {
        const time = new Date().toLocaleTimeString()
        console.log(`[INFO] ${time} - ${text}`)
    }
}

app.get('/admin', (req, res) => {
    fs.readFile('./static/admin.html', (err, data) => {
        if (err) {
            res.send('에러')
        } else {
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.write(data)
            res.end()
        }
    })
})

app.get('/', (req, res) => {
    fs.readFile('./static/display.html', (err, data) => {
        if (err) {
            res.send('에러')
        } else {
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.write(data)
            res.end()
        }
    })
})

io.sockets.on('connection', socket => {
    socket.on('refresh', () => {
        io.to(socket.id).emit('refresh', standby)
    })
    socket.on('filteredinit', () => {
        io.to(socket.id).emit('filteredinit', filteredstandby)
    })
    socket.on('add', data => {
        logger.info(data.name + ' 추가됨')
        standby.push({stat: false, booth: 'all', num: nextnum++, name: data.name})
        io.sockets.emit('refresh', standby)
    })
    socket.on('setstat', num => {
        var index = standby.findIndex(data => data.num == num)
        if (!standby[index].stat) {
            standby[index].stat = true
            filteredstandby.push(standby[index])
            io.sockets.emit('filteredadd', standby[index])
        } else {
            var filteredindex = filteredstandby.findIndex(data => data.num == num)
            standby[index].stat = false
            filteredstandby.splice(filteredindex, 1)
            io.sockets.emit('filteredremove', standby[index].num)
        }
        io.sockets.emit('refresh', standby)
    })
    socket.on('remove', num => {
        var index = standby.findIndex(data => data.num == num)
        var filteredindex = filteredstandby.findIndex(data => data.num == num)
        standby.splice(index, 1)
        filteredstandby.splice(filteredindex, 1)
        io.sockets.emit('refresh', standby)
        io.sockets.emit('filteredremove', num)
    })
})

server.listen(80, () => {
    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
        logger.info(`서버가 시작되었습니다.\n[ http://${add} 를 열어 디스플레이 페이지 열기 ]\n[ http://${add}/admin 를 열어 관리자 페이지 열기 ]\n[ Ctrl+C 를 눌러서 서버 종료하기 ]\n* 이 서비스는 내부 네트워크에서만 동작합니다. 외부에서도 사용하려면 포트 포워딩을 고려해 보십시오.\n* 접속되지 않는다면 명령 프롬프트에 ipconfig를 입력하여 정확한 내부 IP 주소를 확인하십시오.`)
    })
})
