var socket = io()

window.onload = () => {
    socket.emit('refresh')
}

socket.on('refresh', datas => {
    $('#standby').empty()
    datas.forEach(data => {
        $('#standby').append(`
            <p>
                <button onclick="setStat(${data.num})">${data.stat ? '●': '호출'}</button>
                <button onclick="remove(${data.num})">완료</button>
                번호: <b>${data.num}</b> 메모: ${data.name}
            </p>
        `)
    })
})

function send() {
    var name = $('#input-name').val()
    socket.emit('add', {'name': name})
    $('#input-name').val('')
}

function setStat(num) {
    socket.emit('setstat', num)
}

function remove(num) {
    socket.emit('remove', num)
}
