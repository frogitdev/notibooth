var socket = io()

window.onload = () => {
    socket.emit('filteredinit')
}

socket.on('filteredinit', datas => {
    datas.forEach(data => {
        $('#noti').append(`
            <p id="number${data.num}">${data.num}</p>
        `)
    })
})

socket.on('filteredadd', data => {
    $('#noti').append(`
        <p id="number${data.num}">${data.num}</p>
    `)
    document.querySelector('#bell').play()
})

socket.on('filteredremove', num => {
    $(`#number${num}`).remove()
})

function allowAudio() {
    $('#allowaudio').hide()
    document.querySelector('#bell').load()
}
